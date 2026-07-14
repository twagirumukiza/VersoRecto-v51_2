(function(){
  'use strict';
  const STORAGE_KEY='versoRecto.v44.experience';
  const SESSION_KEY='versoRecto.v44.sessions';
  const MAX_POSITIONS=12000;
  let pending=[];

  function empty(){return {schema:'verso-recto-experience-v44',version:44,updatedAt:null,totalGames:0,totalMovesLearned:0,positions:{}};}
  function load(){
    try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');return x&&x.version===44&&x.positions?x:empty();}
    catch(e){return empty();}
  }
  function save(db){db.updatedAt=new Date().toISOString();localStorage.setItem(STORAGE_KEY,JSON.stringify(db));}
  function normalizePieces(pieces){return (pieces||[]).map(p=>[p.id,p.color,p.position,p.face]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]),undefined,{numeric:true}));}
  function positionKey(pieces,playerColor){return JSON.stringify([playerColor||'',normalizePieces(pieces)]);}
  function actionKey(pieceId,to){return String(pieceId)+'>'+String(to);}
  function beginGame(){pending=[];}
  function recordMove(data){
    if(!data||!data.piecesBefore||!data.pieceId||!data.to)return;
    pending.push({
      position:positionKey(data.piecesBefore,data.color), action:actionKey(data.pieceId,data.to),
      pieceId:data.pieceId,to:data.to,playerId:data.playerId||'',color:data.color||'',mode:data.mode||'unknown',ply:Number(data.ply||0)
    });
  }
  function rewardFor(rank,count,isDraw){
    if(isDraw)return 0;
    if(count<=2)return rank===1?1:-1;
    if(rank===1)return 1;
    if(rank===2)return .35;
    if(rank===3)return -.35;
    return -1;
  }
  function finishGame(result){
    if(!pending.length)return;
    const db=load(); const ranking=result&&result.ranking||[]; const players=result&&result.players||[];
    const rankMap=new Map(ranking.map((r,i)=>[String(r.playerId),i+1]));
    const count=Math.max(2,players.length||ranking.length||2); const isDraw=Boolean(result&&result.draw);
    for(const m of pending){
      const pos=db.positions[m.position]||(db.positions[m.position]={visits:0,actions:{}});
      const a=pos.actions[m.action]||(pos.actions[m.action]={pieceId:m.pieceId,to:m.to,plays:0,wins:0,losses:0,draws:0,reward:0,modes:{}});
      const rank=rankMap.get(String(m.playerId))||count;
      const reward=rewardFor(rank,count,isDraw);
      pos.visits++; a.plays++; a.reward+=reward;
      if(reward>0)a.wins++; else if(reward<0)a.losses++; else a.draws++;
      a.modes[m.mode]=(a.modes[m.mode]||0)+1; db.totalMovesLearned++;
    }
    db.totalGames++;
    const keys=Object.keys(db.positions);
    if(keys.length>MAX_POSITIONS){keys.sort((a,b)=>(db.positions[a].visits||0)-(db.positions[b].visits||0));for(let i=0;i<keys.length-MAX_POSITIONS;i++)delete db.positions[keys[i]];}
    save(db); pending=[];
  }
  function bestMove(pieces,playerColor,legalMoves,minPlays){
    const db=load(),pos=db.positions[positionKey(pieces,playerColor)]; if(!pos)return null;
    let best=null;
    for(const move of legalMoves||[]){
      const pieceId=move.pieceId||move.piece&&move.piece.id; const a=pos.actions[actionKey(pieceId,move.to)];
      if(!a||a.plays<(minPlays||2))continue;
      const mean=a.reward/a.plays; const confidence=Math.min(1,a.plays/20); const score=mean*(.55+.45*confidence)+Math.log1p(a.plays)*.02;
      if(!best||score>best.score)best={pieceId,to:move.to,score,plays:a.plays,wins:a.wins,losses:a.losses,draws:a.draws};
    }
    return best;
  }
  function stats(){const db=load();let actions=0;for(const p of Object.values(db.positions))actions+=Object.keys(p.actions||{}).length;return {games:db.totalGames,moves:db.totalMovesLearned,positions:Object.keys(db.positions).length,actions,updatedAt:db.updatedAt};}
  function exportData(){const db=load();const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='verso-recto-v44-experience-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},0);}
  function importData(file){return file.text().then(t=>{const x=JSON.parse(t);if(!x||x.version!==44||!x.positions)throw new Error('Fichier V45 invalide');save(x);return stats();});}
  function clear(){localStorage.removeItem(STORAGE_KEY);pending=[];}
  function markSession(id){if(!id)return false;let x={};try{x=JSON.parse(localStorage.getItem(SESSION_KEY)||'{}')}catch(e){}if(x[id])return false;x[id]=Date.now();const entries=Object.entries(x).sort((a,b)=>b[1]-a[1]).slice(0,300);localStorage.setItem(SESSION_KEY,JSON.stringify(Object.fromEntries(entries)));return true;}
  window.VR45Memory={beginGame,recordMove,finishGame,bestMove,stats,exportData,importData,clear,positionKey,markSession};
})();

window.VR44Memory = window.VR45Memory; // compatibilité du moteur V44 conservé
