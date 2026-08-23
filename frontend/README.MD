# Developer Network Explorer

## Why a Graph Database?
In a relational database (SQL), answering "Find all skills known by contacts up to 2 degrees away from Alice" requires multiple costly `JOIN` operations across separate `Users`, `Connections`, and `Skills` tables. 

Using CognoDB and Cypher, relationships are first-class entities stored on disk. Traversing 2 or more hops (`(p:Developer)-[:KNOWS*1..2]->(peer)`) is an $O(1)$ pointer-chasing operation per node, making relationship-heavy queries fast and expressible in a single line.

## Data Model Diagram