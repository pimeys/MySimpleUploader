s4 = () -> 
  return (((1 + Math.random())*0x10000)|0).toString(16).substring(1)

guid = () -> 
  return (s4()+s4()+"-"+s4()+"-"+s4()+"-"+s4()+"-"+s4()+s4()+s4())

$ ->
  console.log "javascript ok"
  console.log "here's a guid for you " + guid()
