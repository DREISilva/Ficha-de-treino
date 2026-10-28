const DB_NAME = "caderno-treino-local";
const DB_VERSION = 1;
const STATE_KEY = "principal";
const appView = document.querySelector("#appView");
const mainNav = document.querySelector("#mainNav");
const saveStatus = document.querySelector("#saveStatus");
const toast = document.querySelector("#toast");
let data;
let currentWorkoutId = null;
let currentView = "home";
let editMode = false;
let deferredInstallPrompt = null;
let saveTimer;

const seedWorkouts = [
  { id: "A", name: "Push 1", groups: "Peito · Ombros · Tríceps", exercises: [
    ["Supino reto máquina", "Supino reto livre / halteres"], ["Crossover baixo", "Crucifixo máquina / halteres"], ["Pullover com halteres", "Pullover na polia / máquina"], ["Desenvolvimento máquina articulada", "Desenvolvimento halteres / barra"], ["Elevação lateral na máquina", "Elevação lateral halteres / polia"], ["Tríceps francês na polia", "Tríceps testa barra / halteres"], ["Antebraço supinado", "Rosca punho halteres / barra"], ["Antebraço pronado", "Rosca inversa / barra"]
  ]},
  { id: "B", name: "Pull 1", groups: "Costas · Bíceps", exercises: [
    ["Puxada alta pronada", "Puxada supinada / neutra"], ["T-Bar row", "Remada curvada / cavalinho"], ["Remada baixa triângulo", "Remada baixa pronada / neutra"], ["Pulldown na polia", "Pulldown unilateral / puxador aberto"], ["Rosca Scott na máquina", "Rosca Scott barra / halteres"], ["Rosca martelo com halteres", "Rosca alternada / corda"], ["Antebraço supinado", "Rosca punho halteres / barra"], ["Antebraço pronado", "Rosca inversa / barra"]
  ]},
  { id: "C", name: "Legs 1", groups: "Quadríceps · Glúteos", exercises: [
    ["Cadeira flexora", "Flexora deitado / sentado"], ["Cadeira adutora", "Adutora polia / máquina"], ["Agachamento hack", "Agachamento livre / Smith"], ["Elevação pélvica na máquina", "Hip thrust barra / halteres"], ["Cadeira extensora", "Extensora unilateral / livre"], ["Panturrilha em pé", "Panturrilha sentado / leg press"]
  ]},
  { id: "D", name: "Push 2", groups: "Peito · Ombros · Tríceps", exercises: [
    ["Supino inclinado na máquina", "Supino inclinado halteres / barra"], ["Paralelas na máquina", "Dips livre / push-up"], ["Voador", "Crucifixo polia / halteres"], ["Elevação frontal na polia", "Elevação frontal halteres / barra"], ["Elevação lateral com halteres", "Elevação lateral polia / máquina"], ["Tríceps de costas para a polia", "Tríceps corda / testa barra"], ["Antebraço supinado", "Rosca punho halteres / barra"], ["Antebraço pronado", "Rosca inversa / barra"]
  ]},
  { id: "E", name: "Pull 2", groups: "Costas · Bíceps", exercises: [
    ["Remada articulada pronada", "Remada articulada neutra / máquina"], ["Puxador pela frente com triângulo", "Puxada neutra / supinada"], ["Remada baixa unilateral neutra", "Remada unilateral livre / polia"], ["Barra fixa pronada", "Barra fixa supinada / puxador"], ["Rosca bayesiana", "Rosca alternada / Scott"], ["Rosca inversa na polia", "Rosca inversa barra / halteres"], ["Antebraço supinado", "Rosca punho halteres / barra"], ["Antebraço pronado", "Rosca inversa / barra"]
  ]},
  { id: "F", name: "Legs 2", groups: "Posteriores · Glúteos", exercises: [
    ["Stiff com barra livre", "Stiff halteres / Smith"], ["Leg press 45°", "Leg press horizontal / hack"], ["Panturrilha no leg press 45°", "Panturrilha em pé / sentado"], ["Mesa flexora", "Flexora deitado / sentado"], ["Abdutora 45°", "Abdutora polia / máquina"], ["Cadeira extensora", "Extensora unilateral / livre"]
  ]}
].map(workout => ({ ...workout, exercises: workout.exercises.map((item,index) => ({
  id:`${workout.id}-${index+1}`, name:item[0], variation:item[1], notes:"", plannedSets:"", repTarget:""
})) }));

function newId() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]); }
function localDate() { const date=new Date(); return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,10); }
function formatDate(value) { if(!value)return "Data não informada"; const [year,month,day]=value.split("-").map(Number); return new Date(year,month-1,day).toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"}); }
function openDatabase() {
  return new Promise((resolve,reject) => {
    if(!("indexedDB" in window))return reject(new Error("IndexedDB indisponível"));
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains("state"))request.result.createObjectStore("state");};
    request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error||new Error("Não foi possível abrir o armazenamento"));
  });
}
async function readStoredState() {
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{const request=db.transaction("state","readonly").objectStore("state").get(STATE_KEY); request.onsuccess=()=>{db.close();resolve(request.result||null);}; request.onerror=()=>{db.close();reject(request.error);};});
}
async function writeStoredState(value) {
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{const transaction=db.transaction("state","readwrite"); transaction.objectStore("state").put(value,STATE_KEY); transaction.oncomplete=()=>{db.close();resolve();}; transaction.onerror=()=>{db.close();reject(transaction.error);}; transaction.onabort=()=>{db.close();reject(transaction.error||new Error("Gravação cancelada"));};});
}
async function saveState() {
  saveStatus.textContent="Salvando…";
  try { await writeStoredState(data); saveStatus.textContent="Salvo neste aparelho"; }
  catch { try { localStorage.setItem(DB_NAME,JSON.stringify(data)); saveStatus.textContent="Salvo neste navegador"; } catch { saveStatus.textContent="Não foi possível salvar. Exporte um backup e tente novamente."; } }
}
function scheduleSave() { clearTimeout(saveTimer); saveStatus.textContent="Alteração pendente…"; saveTimer=setTimeout(()=>saveState(),180); }
async function loadState() {
  try { data=await readStoredState(); if(!data)data=JSON.parse(localStorage.getItem(DB_NAME)||"null"); } catch { try { data=JSON.parse(localStorage.getItem(DB_NAME)||"null"); } catch { data=null; } }
  if(!data||!Array.isArray(data.workouts)||!Array.isArray(data.sessions)) { data={workouts:JSON.parse(JSON.stringify(seedWorkouts)),sessions:[],version:1}; await saveState(); }
  renderHome();
}
function showToast(message) { toast.textContent=message; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove("show"),2600); }
function setView(view) {
  currentView=view; document.querySelectorAll(".nav-button").forEach(button=>button.classList.toggle("active",button.dataset.view===view));
  if(view==="history")renderHistory(); else if(!currentWorkoutId)renderHome(); else renderWorkout(currentWorkoutId);
  window.scrollTo({top:0,behavior:"smooth"});
}
function getWorkout(id) { return data.workouts.find(workout=>workout.id===id); }
function completedSessions(id) { return data.sessions.filter(session=>session.workoutId===id&&session.status==="completed").sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.completedAt||"").localeCompare(a.completedAt||"")); }
function latestSession(id) { return completedSessions(id)[0]||null; }

function renderHome() {
  currentWorkoutId=null; editMode=false; mainNav.classList.remove("hidden");
  appView.innerHTML=`<h1>Minha ficha</h1><p class="subheading">Escolha o treino de hoje. Sua ficha pode ser ajustada sempre que precisar.</p>
    <div class="section-heading"><div><h2>Seus treinos</h2><span class="muted" style="font-size:12px">Toque em um dia para abrir</span></div><button class="button button-secondary button-small" type="button" data-action="create-workout">+ Criar treino</button></div>
    <div class="workout-grid">${data.workouts.map(workout=>{const last=latestSession(workout.id);return `<button class="workout-card" type="button" data-open-workout="${escapeHtml(workout.id)}"><span class="day-badge">${escapeHtml(workout.id)}</span><strong>${escapeHtml(workout.name)}</strong><small>${escapeHtml(workout.groups||"Grupos musculares não informados")}</small><small>${workout.exercises.length} exercícios${last?` · último: ${escapeHtml(formatDate(last.date))}` : " · ainda sem histórico"}</small></button>`;}).join("")}</div>
    <p class="subheading" style="margin-top:18px;font-size:12px">A ficha inicial usa os exercícios da imagem. Séries e faixas de repetições começam sem prescrição, para você preencher conforme sua ficha.</p>`;
}
function renderWorkout(id) {
  const workout=getWorkout(id); if(!workout)return renderHome();
  currentWorkoutId=id; currentView="home"; document.querySelectorAll(".nav-button").forEach(button=>button.classList.toggle("active",button.dataset.view==="home")); mainNav.classList.remove("hidden");
  const activeSession=data.sessions.find(session=>session.workoutId===id&&session.status==="inProgress"); const previous=latestSession(id);
  appView.innerHTML=`<button class="back-button" type="button" data-action="home">← Todos os treinos</button>
    <div class="workout-header"><div class="workout-topline"><div><h1>${escapeHtml(workout.id)} · ${escapeHtml(workout.name)}</h1><p class="workout-meta">${escapeHtml(workout.groups||"Grupos musculares não informados")} · ${workout.exercises.length} exercícios</p>${editMode?`<div class="inline-fields"><label class="field-label">Nome do treino<input data-workout-field="name" value="${escapeHtml(workout.name)}"></label><label class="field-label">Grupos musculares<input data-workout-field="groups" value="${escapeHtml(workout.groups)}"></label></div>`:""}</div><button class="button button-secondary button-small" type="button" data-action="${editMode?"done-editing":"edit-workout"}">${editMode?"Concluir edição":"Editar ficha"}</button></div></div>
    ${activeSession?`<div class="session-banner"><div><strong>Você tem um treino em andamento</strong><div class="muted" style="font-size:12px;margin-top:3px">${escapeHtml(formatDate(activeSession.date))}. Seu progresso foi salvo.</div></div><button class="button button-small" type="button" data-action="resume-session" data-session="${escapeHtml(activeSession.id)}">Continuar</button></div>`:`<div class="button-row" style="margin:10px 0 16px"><button class="button" type="button" data-action="start-session" data-workout="${escapeHtml(id)}">Iniciar treino ${escapeHtml(id)}</button></div>`}
    <div class="section-heading"><div><h2>Exercícios</h2><span class="muted" style="font-size:12px">Séries e repetições-alvo são editáveis</span></div></div>
    <div class="exercise-list">${workout.exercises.map((exercise,index)=>renderExerciseCard(exercise,index,editMode)).join("")}</div>
    ${editMode?`<div class="button-row" style="margin-top:14px"><button class="button button-secondary" type="button" data-action="add-exercise" data-workout="${escapeHtml(id)}">+ Adicionar exercício</button></div>`:""}
    ${previous?`<div class="previous-line" style="margin-top:18px">Última sessão concluída: ${escapeHtml(formatDate(previous.date))}. Os resultados anteriores também aparecem no registro do treino.</div>`:""}`;
}
function renderExerciseCard(exercise,index,isEditing) {
  if(isEditing)return `<article class="exercise-card"><div class="exercise-head"><span class="exercise-number">${String(index+1).padStart(2,"0")}</span><div class="exercise-title-wrap"><strong class="exercise-title">${escapeHtml(exercise.name||"Novo exercício")}</strong></div></div><div class="inline-fields">
    <label class="field-label field-wide">Nome do exercício<input data-edit-field="name" data-exercise="${escapeHtml(exercise.id)}" value="${escapeHtml(exercise.name)}" placeholder="Ex.: Supino reto"></label>
    <label class="field-label">Variação / alternativa<input data-edit-field="variation" data-exercise="${escapeHtml(exercise.id)}" value="${escapeHtml(exercise.variation)}" placeholder="Ex.: halteres"></label>
    <label class="field-label">Séries planejadas<input data-edit-field="plannedSets" data-exercise="${escapeHtml(exercise.id)}" type="number" inputmode="numeric" min="0" max="30" value="${escapeHtml(exercise.plannedSets)}" placeholder="Ex.: 3"></label>
    <label class="field-label">Repetições-alvo<input data-edit-field="repTarget" data-exercise="${escapeHtml(exercise.id)}" value="${escapeHtml(exercise.repTarget)}" placeholder="Ex.: 8–12"></label>
    <label class="field-label field-wide">Observações<textarea data-edit-field="notes" data-exercise="${escapeHtml(exercise.id)}" placeholder="Anote ajustes, preferências ou lembretes">${escapeHtml(exercise.notes)}</textarea></label></div>
    <div class="exercise-tools"><button class="icon-button" type="button" aria-label="Mover para cima" title="Mover para cima" data-action="move-exercise" data-workout="${escapeHtml(currentWorkoutId)}" data-exercise="${escapeHtml(exercise.id)}" data-direction="-1">↑</button><button class="icon-button" type="button" aria-label="Mover para baixo" title="Mover para baixo" data-action="move-exercise" data-workout="${escapeHtml(currentWorkoutId)}" data-exercise="${escapeHtml(exercise.id)}" data-direction="1">↓</button><button class="button button-danger button-small" type="button" data-action="remove-exercise" data-exercise="${escapeHtml(exercise.id)}">Remover</button></div></article>`;
  const plan=[exercise.plannedSets?`${exercise.plannedSets} séries`:"Séries a definir",exercise.repTarget?`${exercise.repTarget} repetições":"repetições-alvo a definir"].join(" · ");
  return `<article class="exercise-card"><div class="exercise-head"><span class="exercise-number">${String(index+1).padStart(2,"0")}</span><div class="exercise-title-wrap"><h3 class="exercise-title">${escapeHtml(exercise.name)}</h3></div></div>${exercise.variation?`<p class="exercise-variation"><strong>Variação:</strong> ${escapeHtml(exercise.variation)}</p>`:""}${exercise.notes?`<p class="exercise-note">${escapeHtml(exercise.notes)}</p>`:""}<span class="plan-chip">${escapeHtml(plan)}</span></article>`;
}
function createSession(workout) {
  return {id:newId(),workoutId:workout.id,workoutName:workout.name,workoutGroups:workout.groups,date:localDate(),status:"inProgress",startedAt:new Date().toISOString(),completedAt:null,
    exercises:workout.exercises.map(exercise=>({exerciseId:exercise.id,name:exercise.name,variation:exercise.variation,plannedSets:exercise.plannedSets,repTarget:exercise.repTarget,notes:exercise.notes,sets:Array.from({length:Math.min(30,Math.max(0,Number(exercise.plannedSets)||0))},()=>({load:"",reps:""}))}))};
}
function previousExercise(session,exerciseId,name) { if(!session)return null;const found=session.exercises.find(ex=>ex.exerciseId===exerciseId)||session.exercises.find(ex=>ex.name===name);return found?.sets?.length?found.sets:null; }
function renderSession(sessionId) {
  const session=data.sessions.find(item=>item.id===sessionId);if(!session)return renderHome();currentWorkoutId=session.workoutId;currentView="session";mainNav.classList.add("hidden");
  const previous=completedSessions(session.workoutId).find(item=>item.id!==session.id);
  appView.innerHTML=`<button class="back-button" type="button" data-action="back-workout" data-workout="${escapeHtml(session.workoutId)}">← Voltar para a ficha</button><h1>Treino ${escapeHtml(session.workoutId)}</h1><p class="subheading">${escapeHtml(session.workoutName)}${session.workoutGroups?` · ${escapeHtml(session.workoutGroups)}`:""}</p>
    <div class="session-banner"><label>Data do treino<input class="session-date" data-session-date="${escapeHtml(session.id)}" type="date" value="${escapeHtml(session.date)}"></label><span class="muted" style="font-size:12px">Salvamento automático ativado</span></div>
    <div>${session.exercises.map((exercise,index)=>{const prevSets=previousExercise(previous,exercise.exerciseId,exercise.name);const lastLine=prevSets?prevSets.map((set,i)=>`S${i+1}: ${set.load?`${escapeHtml(set.load)} kg`:"—"} × ${set.reps?escapeHtml(set.reps):"—"}`).join(" · "):"Sem registro anterior";return `<article class="session-exercise"><div class="exercise-head"><span class="exercise-number">${String(index+1).padStart(2,"0")}</span><div class="exercise-title-wrap"><h3>${escapeHtml(exercise.name)}</h3>${exercise.variation?`<div class="muted" style="font-size:12px;margin-top:4px">${escapeHtml(exercise.variation)}</div>`:""}</div></div>${exercise.notes?`<p class="exercise-note" style="margin-left:0">${escapeHtml(exercise.notes)}</p>`:""}${exercise.plannedSets||exercise.repTarget?`<div class="plan-chip" style="margin-left:0">Planejado: ${exercise.plannedSets?`${escapeHtml(exercise.plannedSets)} séries`:"séries a definir"}${exercise.repTarget?` · ${escapeHtml(exercise.repTarget)} repetições`:""}</div>`:""}<div class="previous-line">Anterior${previous?` · ${escapeHtml(formatDate(previous.date))}`:""}: ${lastLine}</div>
      ${exercise.sets.length?`<div class="set-header"><span>Série</span><span>Carga (kg)</span><span>Repetições</span><span></span></div>`:`<p class="muted" style="font-size:12px">Adicione as séries realizadas.</p>`}
      ${exercise.sets.map((set,setIndex)=>`<div class="set-row"><span class="set-index">${setIndex+1}</span><input type="number" inputmode="decimal" step="0.1" min="0" aria-label="${escapeHtml(exercise.name)} série ${setIndex+1} carga em kg" placeholder="kg" value="${escapeHtml(set.load)}" data-set-field="load" data-session="${escapeHtml(session.id)}" data-exercise="${escapeHtml(exercise.exerciseId)}" data-set-index="${setIndex}"><input type="number" inputmode="numeric" step="1" min="0" aria-label="${escapeHtml(exercise.name)} série ${setIndex+1} repetições" placeholder="reps" value="${escapeHtml(set.reps)}" data-set-field="reps" data-session="${escapeHtml(session.id)}" data-exercise="${escapeHtml(exercise.exerciseId)}" data-set-index="${setIndex}"><button class="icon-button" type="button" aria-label="Remover série ${setIndex+1}" data-action="remove-set" data-session="${escapeHtml(session.id)}" data-exercise="${escapeHtml(exercise.exerciseId)}" data-set-index="${setIndex}">×</button></div>`).join("")}
      <button class="button button-secondary button-small" style="margin-top:5px" type="button" data-action="add-set" data-session="${escapeHtml(session.id)}" data-exercise="${escapeHtml(exercise.exerciseId)}">+ Adicionar série</button></article>`;}).join("")}</div>
    <div class="session-actions"><button class="button" type="button" data-action="finish-session" data-session="${escapeHtml(session.id)}">Concluir treino</button></div>`;
}
function renderHistory() {
  currentWorkoutId=null;currentView="history";editMode=false;mainNav.classList.remove("hidden");
  const sessions=data.sessions.filter(session=>session.status==="completed").sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.completedAt||"").localeCompare(a.completedAt||""));
  if(!sessions.length){appView.innerHTML=`<h1>Histórico</h1><p class="subheading">Suas sessões concluídas aparecerão aqui.</p><div class="empty-state"><div class="empty-icon">📒</div><strong>Nenhum treino concluído ainda</strong><p>Abra um treino, registre suas séries e toque em “Concluir treino” para criar seu primeiro registro.</p></div>`;return;}
  appView.innerHTML=`<h1>Histórico</h1><p class="subheading">${sessions.length} ${sessions.length===1?"sessão concluída":"sessões concluídas"}. Os registros ficam neste aparelho.</p><div class="history-list">${sessions.map(session=>{const count=session.exercises.reduce((sum,ex)=>sum+ex.sets.length,0);return `<details class="history-item"><summary><span><strong>${escapeHtml(session.workoutId)} · ${escapeHtml(session.workoutName)}</strong><span class="history-date">${escapeHtml(formatDate(session.date))} · ${count} ${count===1?"série":"séries"}</span></span><span aria-hidden="true">⌄</span></summary><div class="history-content">${session.exercises.map(ex=>`<div class="history-exercise"><strong>${escapeHtml(ex.name)}</strong><p>${ex.sets.length?ex.sets.map((set,i)=>`S${i+1}: ${set.load?`${escapeHtml(set.load)} kg`:"—"} × ${set.reps?escapeHtml(set.reps):"—"}`).join(" · "):"Nenhuma série registrada"}</p>${ex.notes?`<p>${escapeHtml(ex.notes)}</p>`:""}</div>`).join("")}</div></details>`;}).join("")}</div>`;
}
function findExercise(workoutId,exerciseId){return getWorkout(workoutId)?.exercises.find(exercise=>exercise.id===exerciseId);}
function findSession(sessionId){return data.sessions.find(session=>session.id===sessionId);}

mainNav.addEventListener("click",event=>{const button=event.target.closest("[data-view]");if(button)setView(button.dataset.view);});
appView.addEventListener("input",event=>{
  const workoutEdit=event.target.closest("[data-workout-field]");if(workoutEdit){const workout=getWorkout(currentWorkoutId);if(workout){workout[workoutEdit.dataset.workoutField]=workoutEdit.value;scheduleSave();}return;}
  const edit=event.target.closest("[data-edit-field]");if(edit){const exercise=findExercise(currentWorkoutId,edit.dataset.exercise);if(!exercise)return;exercise[edit.dataset.editField]=edit.value;scheduleSave();if(edit.dataset.editField==="name"){const title=edit.closest(".exercise-card")?.querySelector(".exercise-title");if(title)title.textContent=edit.value||"Novo exercício";}return;}
  const input=event.target.closest("[data-set-field]");if(input){const session=findSession(input.dataset.session);const exercise=session?.exercises.find(item=>item.exerciseId===input.dataset.exercise);const set=exercise?.sets[Number(input.dataset.setIndex)];if(set){set[input.dataset.setField]=input.value;scheduleSave();}}
});
appView.addEventListener("change",event=>{const date=event.target.closest("[data-session-date]");if(date){const session=findSession(date.dataset.sessionDate);if(session){session.date=date.value;scheduleSave();}}});
appView.addEventListener("click",async event=>{
  const card=event.target.closest("[data-open-workout]");if(card){editMode=false;return renderWorkout(card.dataset.openWorkout);}
  const button=event.target.closest("[data-action]");if(!button)return;const action=button.dataset.action;
  if(action==="home")return renderHome();
  if(action==="back-workout")return renderWorkout(button.dataset.workout);
  if(action==="create-workout"){
    const used=new Set(data.workouts.map(workout=>workout.id));
    const id="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").find(letter=>!used.has(letter));
    if(!id)return showToast("Você já chegou ao limite de letras para criar treinos.");
    const workout={id,name:"Novo treino",groups:"",exercises:[]};data.workouts.push(workout);editMode=true;await saveState();renderWorkout(id);appView.querySelector('[data-workout-field="name"]')?.focus();return;
  }
  if(action==="edit-workout"){editMode=true;return renderWorkout(currentWorkoutId);}
  if(action==="done-editing"){editMode=false;await saveState();return renderWorkout(currentWorkoutId);}
  if(action==="start-session"){
    const workout=getWorkout(button.dataset.workout);if(!workout)return;
    const existing=data.sessions.find(session=>session.workoutId===workout.id&&session.status==="inProgress");const session=existing||createSession(workout);
    if(!existing)data.sessions.push(session);await saveState();return renderSession(session.id);
  }
  if(action==="resume-session")return renderSession(button.dataset.session);
  if(action==="finish-session"){
    const session=findSession(button.dataset.session);if(!session)return;if(!session.date)return showToast("Escolha a data do treino antes de concluir.");
    session.status="completed";session.completedAt=new Date().toISOString();await saveState();showToast("Treino concluído e salvo no histórico.");return renderWorkout(session.workoutId);
  }
  if(action==="add-set"){const session=findSession(button.dataset.session);const exercise=session?.exercises.find(item=>item.exerciseId===button.dataset.exercise);if(exercise&&exercise.sets.length<30){exercise.sets.push({load:"",reps:""});await saveState();renderSession(session.id);}return;}
  if(action==="remove-set"){const session=findSession(button.dataset.session);const exercise=session?.exercises.find(item=>item.exerciseId===button.dataset.exercise);if(exercise){exercise.sets.splice(Number(button.dataset.setIndex),1);await saveState();renderSession(session.id);}return;}
  if(action==="add-exercise"){const workout=getWorkout(button.dataset.workout);if(!workout)return;workout.exercises.push({id:newId(),name:"",variation:"",notes:"",plannedSets:"",repTarget:""});editMode=true;await saveState();renderWorkout(workout.id);appView.querySelectorAll('[data-edit-field="name"]').at(-1)?.focus();return;}
  if(action==="remove-exercise"){const workout=getWorkout(currentWorkoutId);if(!workout)return;workout.exercises=workout.exercises.filter(exercise=>exercise.id!==button.dataset.exercise);editMode=true;await saveState();return renderWorkout(currentWorkoutId);}
  if(action==="move-exercise"){const workout=getWorkout(button.dataset.workout);if(!workout)return;const index=workout.exercises.findIndex(ex=>ex.id===button.dataset.exercise);const target=index+Number(button.dataset.direction);if(index>=0&&target>=0&&target<workout.exercises.length){[workout.exercises[index],workout.exercises[target]]=[workout.exercises[target],workout.exercises[index]];editMode=true;await saveState();renderWorkout(workout.id);}return;}
});

document.querySelector("#backupButton").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify({app:"Caderno de Treino",version:1,exportedAt:new Date().toISOString(),data},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=`backup-caderno-treino-${localDate()}.json`;document.body.append(link);link.click();link.remove();URL.revokeObjectURL(url);showToast("Backup exportado. Guarde o arquivo em local seguro.");
});
document.querySelector("#restoreButton").addEventListener("click",()=>document.querySelector("#restoreInput").click());
document.querySelector("#restoreInput").addEventListener("change",async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{const parsed=JSON.parse(await file.text());const imported=parsed.data||parsed;if(!Array.isArray(imported.workouts)||!Array.isArray(imported.sessions))throw new Error("Arquivo incompatível");
    if(!window.confirm("Importar este backup substituirá a ficha e o histórico salvos neste aparelho. Deseja continuar?"))return;
    data={workouts:imported.workouts,sessions:imported.sessions,version:1};await saveState();showToast("Backup restaurado.");setView("home");
  }catch{showToast("Não consegui ler esse backup. Escolha um arquivo JSON exportado pelo app.");}finally{event.target.value="";}
});
window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredInstallPrompt=event;document.querySelector("#installButton").classList.remove("hidden");});
document.querySelector("#installButton").addEventListener("click",async()=>{if(!deferredInstallPrompt)return showToast("Use o menu do navegador e escolha ‘Adicionar à tela inicial’.");deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;document.querySelector("#installButton").classList.add("hidden");});
if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
loadState();
