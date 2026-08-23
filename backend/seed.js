import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
dotenv.config();

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(process.env.COGNODB_USER, process.env.COGNODB_PASSWORD)
);

async function seed() {
  const session = driver.session();
  try {
    console.log('Cleaning existing graph...');
    await session.run('MATCH (n) DETACH DELETE n');

    console.log('Inserting seed data...');
    const seedQuery = `
      // Create Developers
      CREATE (alice:Developer {id: 'dev1', name: 'Alice', role: 'Senior Backend Engineeer'})
      CREATE (bob:Developer {id: 'dev2', name: 'Bob', role: 'Full Stack Engineer'})
      CREATE (charlie:Developer {id: 'dev3', name: 'Charlie', role: 'Frontend Specialist'})
      
      // Create Tech Stacks / Skills
      CREATE (node:Skill {id: 's1', name: 'Node.js', category: 'Backend'})
      CREATE (react:Skill {id: 's2', name: 'React', category: 'Frontend'})
      CREATE (graph:Skill {id: 's3', name: 'CognoDB', category: 'Database'})

      // Create Projects
      CREATE (projA:Project {id: 'p1', name: 'Fintech Engine'})
      CREATE (projB:Project {id: 'p2', name: 'AI Dashboard'})

      // Create Relationships
      CREATE (alice)-[:KNOWS]->(bob)
      CREATE (bob)-[:KNOWS]->(charlie)
      
      CREATE (alice)-[:HAS_SKILL {proficiency: 'Expert'}]->(node)
      CREATE (alice)-[:HAS_SKILL {proficiency: 'Intermediate'}]->(graph)
      CREATE (bob)-[:HAS_SKILL {proficiency: 'Expert'}]->(react)
      CREATE (charlie)-[:HAS_SKILL {proficiency: 'Expert'}]->(react)

      CREATE (projA)-[:REQUIRES]->(node)
      CREATE (projA)-[:REQUIRES]->(graph)
      CREATE (projB)-[:REQUIRES]->(react)
    `;

    await session.run(seedQuery);
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();