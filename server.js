const express=require("express");
const db=require("./db");
const {validate,domains,modes}=require("./validation");
const app=express(); const PORT=Number(process.env.PORT)||3000;
app.disable("x-powered-by"); app.use(express.json({limit:"100kb"}));
const error=(res,status,code,message,details)=>res.status(status).json({success:false,error:{code,message,...(details?{details}:{})}});
const record=r=>r&&({...r,skills:JSON.parse(r.skills||"[]"),createdAt:r.created_at,updatedAt:r.updated_at,created_at:undefined,updated_at:undefined});
const get=id=>record(db.prepare("SELECT * FROM internships WHERE id=?").get(id));
const parseId=s=>/^[1-9]\d*$/.test(String(s))&&Number.isSafeInteger(Number(s))?Number(s):null;
const fields=["title","company","domain","description","location","mode","duration","stipend","skills"];
function writeValues(b){return [b.title.trim(),b.company.trim(),b.domain,b.description.trim(),b.location.trim(),b.mode,b.duration.trim(),b.stipend.trim(),JSON.stringify(b.skills.map(s=>s.trim()))];}
app.get("/",(req,res)=>res.json({name:"Internship Records API",health:"/api/health",endpoints:["GET /api/internships","GET /api/internships/:id","POST /api/internships","PUT /api/internships/:id","PATCH /api/internships/:id","DELETE /api/internships/:id"]}));
app.get("/api/health",(req,res)=>res.json({success:true,data:{status:"ok"}}));
app.get("/api/internships",(req,res)=>{
 const pageRaw=req.query.page??"1",limitRaw=req.query.limit??"10";
 if(!/^[1-9]\d*$/.test(String(pageRaw))||!/^[1-9]\d*$/.test(String(limitRaw))) return error(res,400,"INVALID_PAGINATION","page and limit must be positive integers.");
 const page=Number(pageRaw),limit=Number(limitRaw);
 if(!Number.isSafeInteger(page)||!Number.isSafeInteger(limit)||limit>100) return error(res,400,"INVALID_PAGINATION","page must be safe and limit must be 1-100.");
 const clauses=[],p={};
 if(req.query.domain){if(!domains.includes(req.query.domain))return error(res,400,"INVALID_FILTER","Unsupported domain.");clauses.push("domain=@domain");p.domain=req.query.domain;}
 if(req.query.mode){if(!modes.includes(req.query.mode))return error(res,400,"INVALID_FILTER","Unsupported mode.");clauses.push("mode=@mode");p.mode=req.query.mode;}
 if(req.query.search!==undefined){if(typeof req.query.search!=="string"||req.query.search.length>100)return error(res,400,"INVALID_SEARCH","search must be 100 characters or fewer.");clauses.push("(title LIKE @search OR company LIKE @search OR description LIKE @search OR location LIKE @search OR skills LIKE @search)");p.search=`%${req.query.search.trim()}%`;}
 const where=clauses.length?"WHERE "+clauses.join(" AND "):"";
 const total=db.prepare(`SELECT COUNT(*) n FROM internships ${where}`).get(p).n;
 const data=db.prepare(`SELECT * FROM internships ${where} ORDER BY id LIMIT @limit OFFSET @offset`).all({...p,limit,offset:(page-1)*limit}).map(record);
 res.json({success:true,data,pagination:{page,limit,total,totalPages:Math.ceil(total/limit),hasNextPage:page*limit<total,hasPreviousPage:page>1}});
});
app.get("/api/internships/:id",(req,res)=>{const id=parseId(req.params.id);if(!id)return error(res,400,"INVALID_ID","id must be a positive integer.");const data=get(id);return data?res.json({success:true,data}):error(res,404,"NOT_FOUND",`Internship ${id} was not found.`);});
app.post("/api/internships",(req,res)=>{const v=validate(req.body);if(!v.valid)return error(res,400,"VALIDATION_ERROR","Request validation failed.",v.errors);const q=db.prepare("INSERT INTO internships(title,company,domain,description,location,mode,duration,stipend,skills) VALUES(?,?,?,?,?,?,?,?,?)");const info=q.run(...writeValues(req.body));res.status(201).json({success:true,data:get(Number(info.lastInsertRowid))});});
app.put("/api/internships/:id",(req,res)=>{const id=parseId(req.params.id);if(!id)return error(res,400,"INVALID_ID","id must be a positive integer.");if(!get(id))return error(res,404,"NOT_FOUND",`Internship ${id} was not found.`);const v=validate(req.body);if(!v.valid)return error(res,400,"VALIDATION_ERROR","Request validation failed.",v.errors);db.prepare("UPDATE internships SET title=?,company=?,domain=?,description=?,location=?,mode=?,duration=?,stipend=?,skills=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").run(...writeValues(req.body),id);res.json({success:true,data:get(id)});});
app.patch("/api/internships/:id",(req,res)=>{const id=parseId(req.params.id);if(!id)return error(res,400,"INVALID_ID","id must be a positive integer.");const old=get(id);if(!old)return error(res,404,"NOT_FOUND",`Internship ${id} was not found.`);if(!req.body||typeof req.body!=="object"||Array.isArray(req.body)||!Object.keys(req.body).length)return error(res,400,"EMPTY_UPDATE","Provide fields to update.");const v=validate(req.body,true);if(!v.valid)return error(res,400,"VALIDATION_ERROR","Request validation failed.",v.errors);const merged={...old,...req.body};delete merged.id;delete merged.createdAt;delete merged.updatedAt;const full=validate(merged);if(!full.valid)return error(res,400,"VALIDATION_ERROR","Request validation failed.",full.errors);db.prepare("UPDATE internships SET title=?,company=?,domain=?,description=?,location=?,mode=?,duration=?,stipend=?,skills=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").run(...writeValues(merged),id);res.json({success:true,data:get(id)});});
app.delete("/api/internships/:id",(req,res)=>{const id=parseId(req.params.id);if(!id)return error(res,400,"INVALID_ID","id must be a positive integer.");const out=db.prepare("DELETE FROM internships WHERE id=?").run(id);if(!out.changes)return error(res,404,"NOT_FOUND",`Internship ${id} was not found.`);res.status(204).end();});
app.use((req,res)=>error(res,404,"ROUTE_NOT_FOUND",`No route exists for ${req.method} ${req.path}.`));
app.use((err,req,res,next)=>{if(err instanceof SyntaxError&&"body" in err)return error(res,400,"INVALID_JSON","Request body contains invalid JSON.");if(err.type==="entity.too.large")return error(res,413,"PAYLOAD_TOO_LARGE","Request body exceeds 100 KB.");console.error(err);return error(res,500,"INTERNAL_ERROR","Unexpected server error.");});
if(require.main===module)app.listen(PORT,()=>console.log(`API listening on http://localhost:${PORT}`));
module.exports=app;
