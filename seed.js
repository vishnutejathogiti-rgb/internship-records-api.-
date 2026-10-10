const db=require("./db");
const rows=[
["Frontend Developer Intern","BrightLayer Studio","Technology","Build accessible web interfaces and responsive experiences.","India","Remote","3 months","₹8,000–₹12,000/mo",["HTML","CSS","JavaScript"]],
["Data Analyst Intern","Northstar Insights","Data","Explore datasets and create clear dashboards for business teams.","Hyderabad","Hybrid","6 months","₹10,000/mo",["Python","SQL","Excel"]],
["UI/UX Design Intern","Mango Pixel","Design","Research user needs and create thoughtful prototypes for digital products.","India","Remote","3 months","₹7,000–₹10,000/mo",["Figma","Prototyping","Research"]],
["AI / Machine Learning Intern","Cobalt Labs","Data","Prepare training data and learn how machine-learning models are evaluated.","Bengaluru","On-site","4 months","₹15,000/mo",["Python","Pandas","Machine Learning"]],
["Digital Marketing Intern","Goodday Collective","Marketing","Plan campaigns and measure content performance across channels.","India","Remote","2 months","₹5,000/mo",["Content","SEO","Analytics"]],
["Business Operations Intern","Evergreen Works","Business","Organise project information and help improve team workflows.","Hyderabad","Hybrid","3 months","₹8,000/mo",["Excel","Communication","Research"]]
];
const count=db.prepare("SELECT COUNT(*) n FROM internships").get().n;
if(count) console.log(`Seed skipped; ${count} records already exist.`);
else {const insert=db.prepare("INSERT INTO internships(title,company,domain,description,location,mode,duration,stipend,skills) VALUES(?,?,?,?,?,?,?,?,?)");
const tx=db.transaction(items=>items.forEach(r=>insert.run(...r.slice(0,8),JSON.stringify(r[8]))));tx(rows);console.log(`Seeded ${rows.length} records.`);}
db.close();
