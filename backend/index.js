import express from 'express';
import cors from 'cors';
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(process.env.COGNODB_USER, process.env.COGNODB_PASSWORD)
);

// Graceful Database Error Handling
const checkDbConnection = async (req, res, next) => {
  try {
    await driver.verifyConnectivity();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database service unavailable', details: err.message });
  }
};

app.use(checkDbConnection);

// Endpoint 1: Get Graph Network Overview
app.get('/api/graph', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (n)-[r]->(m)
      RETURN n.name AS source, type(r) AS rel, m.name AS target
      LIMIT 50
    `);
    const connections = result.records.map(rec => ({
      source: rec.get('source'),
      relationship: rec.get('rel'),
      target: rec.get('target')
    }));
    res.json({ connections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// Endpoint 2: Multi-hop Query (Find skilled developers via 2-hop network)
// Cypher Traversal: (Developer)-[:KNOWS]->(Developer)-[:HAS_SKILL]->(Skill)
app.get('/api/recommendations/:devName', async (req, res) => {
  const { devName } = req.params;
  const session = driver.session();
  
  try {
    const query = `
      MATCH (p:Developer {name: $name})-[:KNOWS*1..2]->(peer:Developer)-[r:HAS_SKILL]->(s:Skill)
      WHERE p <> peer
      RETURN DISTINCT peer.name AS peerName, s.name AS skillName, r.proficiency AS proficiency
    `;
    
    // Parameterised Query execution
    const result = await session.run(query, { name: devName });
    const recommendations = result.records.map(rec => ({
      peer: rec.get('peerName'),
      skill: rec.get('skillName'),
      proficiency: rec.get('proficiency')
    }));

    res.json({ developer: devName, recommendations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));