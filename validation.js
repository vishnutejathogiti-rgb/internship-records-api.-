const domains = ["Technology","Data","Design","Marketing","Business"];
const modes = ["Remote","Hybrid","On-site"];
const lengths = {title:[3,120],company:[2,100],description:[10,1000],location:[2,100],duration:[2,60],stipend:[2,80]};
function validate(body, partial=false) {
 const errors=[];
 if (!body || typeof body!=="object" || Array.isArray(body)) return {valid:false,errors:[{field:"body",message:"Must be a JSON object."}]};
 const allowed=[...Object.keys(lengths),"domain","mode","skills"];
 for (const k of Object.keys(body)) if(!allowed.includes(k)) errors.push({field:k,message:"Unknown field."});
 for(const [k,[min,max]] of Object.entries(lengths)){
  if(partial && !(k in body)) continue;
  if(typeof body[k]!=="string") errors.push({field:k,message:"Must be a string."});
  else if(body[k].trim().length<min || body[k].trim().length>max) errors.push({field:k,message:`Must be ${min}-${max} characters.`});
 }
 if((!partial||"domain" in body)&&!domains.includes(body.domain)) errors.push({field:"domain",message:`Must be one of ${domains.join(", ")}.`});
 if((!partial||"mode" in body)&&!modes.includes(body.mode)) errors.push({field:"mode",message:`Must be one of ${modes.join(", ")}.`});
 if(!partial||"skills" in body) if(!Array.isArray(body.skills)||body.skills.length>20||body.skills.some(s=>typeof s!=="string"||s.trim().length<1||s.trim().length>40)) errors.push({field:"skills",message:"Must be an array of up to 20 strings (1-40 chars each)."});
 return {valid:errors.length===0,errors};
}
module.exports={validate,domains,modes};
