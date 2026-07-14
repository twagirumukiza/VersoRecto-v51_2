(function(){
  'use strict';
  const STORAGE_KEY='versoRecto.v51.experience';
  const LEGACY_KEY='versoRecto.v48.experience';
  const SESSION_KEY='versoRecto.v51.sessions';
  const MAX_POSITIONS=14000;
  const MIN_RELIABLE_PLAYS=3;
  let pending=[];

  function empty(){return {schema:'verso-recto-experience-v51',version:50,updatedAt:null,totalGames:0,totalMovesLearned:0,positions:{},profiles:{stable:null,candidate:null,championTests:[]}};}
  function migrateLegacy(){
    try{
      const old=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');
      if(!old||!old.positions)return null;
      return {schema:'verso-recto-experience-v51',version:50,updatedAt:old.updatedAt||null,totalGames:Number(old.totalGames||0),totalMovesLearned:Number(old.totalMovesLearned||0),positions:old.positions,profiles:{stable:null,candidate:null,championTests:[]}};
    }catch(e){return null;}
  }
  function load(){
    try{
      const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(x&&x.version===50&&x.positions)return x;
      const migrated=migrateLegacy(); if(migrated){save(migrated);return migrated;}
      return empty();
    }catch(e){return empty();}
  }
  function save(db){db.updatedAt=new Date().toISOString();localStorage.setItem(STORAGE_KEY,JSON.stringify(db));}
  function normalizePieces(pieces){return (pieces||[]).map(p=>[p.id,p.color,p.position,p.face]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]),undefined,{numeric:true}));}
  function positionKey(pieces,playerColor){return JSON.stringify([playerColor||'',normalizePieces(pieces)]);}
  function actionKey(pieceId,to){return String(pieceId)+'>'+String(to);}
  function beginGame(){pending=[];try{sessionStorage.removeItem('versoRecto.v51.pending');}catch(e){}}
  function recordMove(data){
    if(!data||!data.piecesBefore||!data.pieceId||!data.to)return;
    pending.push({position:positionKey(data.piecesBefore,data.color),action:actionKey(data.pieceId,data.to),pieceId:data.pieceId,to:data.to,playerId:data.playerId||'',color:data.color||'',mode:data.mode||'unknown',ply:Number(data.ply||0)});
    try{sessionStorage.setItem('versoRecto.v51.pending',JSON.stringify(pending));}catch(e){}
  }
  function rewardFor(rank,count,isDraw){if(isDraw)return 0;if(count<=2)return rank===1?1:-1;if(rank===1)return 1;if(rank===2)return .35;if(rank===3)return -.35;return -1;}
  function finishGame(result){
    if(!pending.length){try{pending=JSON.parse(sessionStorage.getItem('versoRecto.v51.pending')||'[]')||[];}catch(e){pending=[];}}
    if(!pending.length)return false;
    const db=load(),ranking=result&&result.ranking||[],players=result&&result.players||[];
    const rankMap=new Map(ranking.map((r,i)=>[String(r.playerId),i+1]));
    const count=Math.max(2,players.length||ranking.length||2),isDraw=Boolean(result&&result.draw);
    for(const m of pending){
      const pos=db.positions[m.position]||(db.positions[m.position]={visits:0,actions:{}});
      const a=pos.actions[m.action]||(pos.actions[m.action]={pieceId:m.pieceId,to:m.to,plays:0,wins:0,losses:0,draws:0,reward:0,rewardSq:0,modes:{}});
      const rank=rankMap.get(String(m.playerId))||count,reward=rewardFor(rank,count,isDraw);
      pos.visits++;a.plays++;a.reward+=reward;a.rewardSq=(a.rewardSq||0)+reward*reward;
      if(reward>0)a.wins++;else if(reward<0)a.losses++;else a.draws++;
      a.modes[m.mode]=(a.modes[m.mode]||0)+1;db.totalMovesLearned++;
    }
    db.totalGames++;
    const keys=Object.keys(db.positions);
    if(keys.length>MAX_POSITIONS){keys.sort((a,b)=>(db.positions[a].visits||0)-(db.positions[b].visits||0));for(let i=0;i<keys.length-MAX_POSITIONS;i++)delete db.positions[keys[i]];}
    save(db);pending=[];try{sessionStorage.removeItem('versoRecto.v51.pending');}catch(e){}return true;
  }
  function actionScore(a){
    if(!a||!a.plays)return {score:0,confidence:0,mean:0};
    const mean=a.reward/a.plays;
    const variance=Math.max(0,(a.rewardSq||a.plays)/a.plays-mean*mean);
    const confidence=Math.min(1,Math.log1p(a.plays)/Math.log(31));
    const uncertainty=Math.sqrt(variance/Math.max(1,a.plays));
    const conservative=mean-0.55*uncertainty;
    return {score:conservative*(.55+.45*confidence),confidence,mean};
  }
  function getPriors(pieces,playerColor,legalMoves){
    const db=load(),pos=db.positions[positionKey(pieces,playerColor)],out={};if(!pos)return out;
    for(const move of legalMoves||[]){const pieceId=move.pieceId||move.piece&&move.piece.id,a=pos.actions[actionKey(pieceId,move.to)];if(!a)continue;const s=actionScore(a);out[actionKey(pieceId,move.to)]={...s,plays:a.plays,wins:a.wins,losses:a.losses,draws:a.draws};}
    return out;
  }
  function bestMove(pieces,playerColor,legalMoves,minPlays){
    const priors=getPriors(pieces,playerColor,legalMoves);let best=null;
    for(const move of legalMoves||[]){const pieceId=move.pieceId||move.piece&&move.piece.id,p=priors[actionKey(pieceId,move.to)];if(!p||p.plays<(minPlays||MIN_RELIABLE_PLAYS))continue;if(!best||p.score>best.score)best={pieceId,to:move.to,...p};}
    return best;
  }
  function stats(){const db=load();let actions=0,reliableActions=0;for(const p of Object.values(db.positions)){for(const a of Object.values(p.actions||{})){actions++;if((a.plays||0)>=MIN_RELIABLE_PLAYS)reliableActions++;}}return {games:db.totalGames,moves:db.totalMovesLearned,positions:Object.keys(db.positions).length,actions,reliableActions,updatedAt:db.updatedAt};}
  function setCandidateProfile(weights,meta){const db=load();db.profiles=db.profiles||{};db.profiles.candidate={weights,meta:meta||{},createdAt:new Date().toISOString()};save(db);return db.profiles.candidate;}
  function promoteCandidate(test){const db=load();if(!db.profiles?.candidate)return false;db.profiles.stable=db.profiles.candidate;db.profiles.candidate=null;db.profiles.championTests=db.profiles.championTests||[];db.profiles.championTests.push({...test,promotedAt:new Date().toISOString()});save(db);return true;}
  function profiles(){return load().profiles||{stable:null,candidate:null,championTests:[]};}
  function exportData(){const db=load(),blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='verso-recto-v51-experience-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},0);}
  function importData(file){return file.text().then(t=>{const x=JSON.parse(t);if(!x||!x.positions||![48,50].includes(x.version))throw new Error('Fichier V48/V51 invalide');if(x.version===48){x.version=50;x.schema='verso-recto-experience-v51';x.profiles={stable:null,candidate:null,championTests:[]};}save(x);return stats();});}
  function clear(){localStorage.removeItem(STORAGE_KEY);pending=[];try{sessionStorage.removeItem('versoRecto.v51.pending');}catch(e){}}
  function markSession(id){if(!id)return false;let x={};try{x=JSON.parse(localStorage.getItem(SESSION_KEY)||'{}')}catch(e){}if(x[id])return false;x[id]=Date.now();localStorage.setItem(SESSION_KEY,JSON.stringify(Object.fromEntries(Object.entries(x).sort((a,b)=>b[1]-a[1]).slice(0,300))));return true;}
  window.VR50Memory={beginGame,recordMove,finishGame,bestMove,getPriors,stats,exportData,importData,clear,positionKey,markSession,setCandidateProfile,promoteCandidate,profiles};
  window.VR48Memory=window.VR50Memory;window.VR45Memory=window.VR50Memory;window.VR44Memory=window.VR50Memory;
})();
