"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Stage = "Prospect" | "RDV" | "Essai" | "Inscrit" | "Résilié";
type View = "Vue d’ensemble" | "Contacts" | "Parcours" | "Agent IA" | "Inbox" | "Agenda" | "Automatisations" | "Campagnes" | "Programmes" | "Finance";
type Contact = { id: string; name: string; email: string; phone: string; source: string; stage: Stage; next: string; activity: string };
type EventItem = { id: string; date: string; label: string; contact: string; detail: string };
type Automation = { id: string; service: "Airtable" | "Brevo" | "WhatsApp" | "Make"; name: string; status: "Actif" | "En pause"; lastRun: string };
type Program = { id: string; client: string; goal: string; frequency: string; status: "À valider" | "Validé"; createdAt: string };
type Exercise = { id: string; name: string; muscle: string; equipment: string; level: "Débutant" | "Intermédiaire" | "Avancé"; prescription: string; cue: string };
type WorkoutSession = { id: string; client: string; date: string; label: string; duration: string; completion: number; volume: string };
type FinanceItem = { id: string; month: string; type: "CA" | "Charge"; category: string; amount: number };
type Database = { contacts: Contact[]; events: EventItem[]; automations: Automation[]; programs: Program[]; workouts: WorkoutSession[]; finance: FinanceItem[] };

const STORAGE_KEY = "fitflow-crm-portfolio-v2";
const views: { name: View; icon: string }[] = [
  { name: "Vue d’ensemble", icon: "⌂" }, { name: "Contacts", icon: "◎" }, { name: "Parcours", icon: "↝" }, { name: "Agent IA", icon: "✦" },
  { name: "Inbox", icon: "◉" }, { name: "Agenda", icon: "◷" }, { name: "Automatisations", icon: "ϟ" }, { name: "Campagnes", icon: "✉" }, { name: "Programmes", icon: "▤" }, { name: "Finance", icon: "▥" },
];
const stages: Stage[] = ["Prospect", "RDV", "Essai", "Inscrit", "Résilié"];
const exerciseLibrary: Exercise[] = [
  { id: "ex-1", name: "Goblet squat", muscle: "Jambes", equipment: "Haltère", level: "Débutant", prescription: "3 × 10 reps", cue: "Genoux dans l’axe, tempo contrôlé" },
  { id: "ex-2", name: "Développé couché", muscle: "Pectoraux", equipment: "Barre", level: "Intermédiaire", prescription: "4 × 8 reps", cue: "Omoplates serrées, trajectoire stable" },
  { id: "ex-3", name: "Soulevé de terre roumain", muscle: "Ischio-jambiers", equipment: "Barre", level: "Intermédiaire", prescription: "3 × 10 reps", cue: "Hanches en arrière, dos neutre" },
  { id: "ex-4", name: "Tirage vertical", muscle: "Dos", equipment: "Machine", level: "Débutant", prescription: "3 × 12 reps", cue: "Tirer les coudes vers les côtes" },
  { id: "ex-5", name: "Fentes marchées", muscle: "Jambes", equipment: "Poids du corps", level: "Débutant", prescription: "3 × 12 / jambe", cue: "Pousser dans le pied avant" },
  { id: "ex-6", name: "Développé épaules", muscle: "Épaules", equipment: "Haltères", level: "Intermédiaire", prescription: "3 × 10 reps", cue: "Garder les côtes rentrées" },
  { id: "ex-7", name: "Planche active", muscle: "Core", equipment: "Poids du corps", level: "Débutant", prescription: "3 × 40 sec", cue: "Respirer sans creuser le bas du dos" },
  { id: "ex-8", name: "Rowing unilatéral", muscle: "Dos", equipment: "Haltère", level: "Avancé", prescription: "4 × 8 / côté", cue: "Initier le mouvement avec le coude" },
];
const initialDatabase: Database = {
  contacts: [
    { id: "c1", name: "Léa Dubois", email: "lea@exemple.fr", phone: "06 10 24 83 11", source: "Site web", stage: "RDV", next: "Appel découverte", activity: "Il y a 2 h" },
    { id: "c2", name: "Thomas Bernard", email: "thomas@exemple.fr", phone: "06 21 88 40 25", source: "Google", stage: "Essai", next: "Séance d’essai", activity: "Il y a 4 h" },
    { id: "c3", name: "Clara Petit", email: "clara@exemple.fr", phone: "06 45 12 80 16", source: "Parrainage", stage: "Inscrit", next: "Onboarding", activity: "Il y a 1 j" },
    { id: "c4", name: "Julien Moreau", email: "julien@exemple.fr", phone: "06 31 66 97 12", source: "Instagram", stage: "Prospect", next: "Envoyer programme", activity: "Il y a 1 j" },
    { id: "c5", name: "Sophie Renaud", email: "sophie@exemple.fr", phone: "06 70 48 32 57", source: "Campagne Brevo", stage: "RDV", next: "Visite studio", activity: "Il y a 2 j" },
  ],
  events: [
    { id: "e1", date: "Aujourd’hui · 09:35", label: "RDV planifié", contact: "Léa Dubois", detail: "Airtable synchronisé · Brevo relance activée" },
    { id: "e2", date: "Aujourd’hui · 08:10", label: "Programme envoyé", contact: "Clara Petit", detail: "Validation coach terminée" },
    { id: "e3", date: "Hier · 17:25", label: "Nouveau prospect", contact: "Julien Moreau", detail: "Source : Instagram · Make exécuté" },
  ],
  automations: [
    { id: "a1", service: "Airtable", name: "Synchroniser contact et statut", status: "Actif", lastRun: "Il y a 5 min" },
    { id: "a2", service: "Brevo", name: "Séquence après séance d’essai", status: "Actif", lastRun: "Il y a 18 min" },
    { id: "a3", service: "WhatsApp", name: "Rappel de RDV à 24 h", status: "Actif", lastRun: "Il y a 37 min" },
    { id: "a4", service: "Make", name: "Nouveau RDV depuis site web", status: "Actif", lastRun: "Il y a 1 h" },
  ],
  programs: [
    { id: "p1", client: "Clara Petit", goal: "Prise de masse", frequency: "4 séances / semaine", status: "À valider", createdAt: "Aujourd’hui" },
    { id: "p2", client: "Thomas Bernard", goal: "Reprise sportive", frequency: "3 séances / semaine", status: "Validé", createdAt: "Hier" },
  ],
  workouts: [
    { id: "w1", client: "Clara Petit", date: "Aujourd’hui", label: "Full body · Semaine 1", duration: "48 min", completion: 100, volume: "4 820 kg" },
    { id: "w2", client: "Thomas Bernard", date: "Hier", label: "Reprise · Séance 2", duration: "36 min", completion: 75, volume: "2 140 kg" },
    { id: "w3", client: "Clara Petit", date: "Lun. 10 août", label: "Bas du corps", duration: "52 min", completion: 100, volume: "5 180 kg" },
  ],
  finance: [
    { id: "f1", month: "2026-08", type: "CA", category: "Abonnements", amount: 18460 },
    { id: "f2", month: "2026-08", type: "Charge", category: "Salaires", amount: 6350 },
    { id: "f3", month: "2026-08", type: "Charge", category: "Loyer", amount: 2200 },
    { id: "f4", month: "2026-08", type: "Charge", category: "Publicité", amount: 1450 },
  ],
};

function useMountEffect(effect: () => void | (() => void)) {
  useEffect(effect, []);
}

function initials(name: string) { return name.split(" ").map((part) => part[0]).join("").slice(0, 2); }
function euro(amount: number) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount); }
function serviceClass(service: Automation["service"]) { return service.toLowerCase().replace(" ", "-"); }
function serviceLogo(service: Automation["service"]) { return `/integrations/${service.toLowerCase()}.svg`; }
function stageClass(stage: Stage) { return stage.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

export function FitFlowWorkspace() {
  const [database, setDatabase] = useState<Database>(initialDatabase);
  const [activeView, setActiveView] = useState<View>("Vue d’ensemble");
  const [eventOpen, setEventOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [contactFilter, setContactFilter] = useState<Stage | "Tous">("Tous");
  const [programTab, setProgramTab] = useState<"builder" | "library" | "progress">("builder");
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [exerciseMuscle, setExerciseMuscle] = useState("Tous");
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>(["ex-1", "ex-4", "ex-7"]);
  const [sessionClient, setSessionClient] = useState("Clara Petit");
  const [notice, setNotice] = useState("Données de démonstration locales");

  useMountEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<Database>;
      setDatabase({ ...initialDatabase, ...parsed, workouts: parsed.workouts ?? initialDatabase.workouts });
    }
  });

  const commit = (next: Database, message: string) => {
    setDatabase(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setNotice(message);
  };
  const contactsByStage = (stage: Stage) => database.contacts.filter((contact) => contact.stage === stage);
  const currentFinance = database.finance.filter((entry) => entry.month === "2026-08");
  const turnover = currentFinance.filter((entry) => entry.type === "CA").reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = currentFinance.filter((entry) => entry.type === "Charge").reduce((sum, entry) => sum + entry.amount, 0);
  const validatedPrograms = database.programs.filter((program) => program.status === "Validé").length;

  const createEvent = (form: FormData) => {
    const contact = database.contacts.find((item) => item.id === form.get("contact"));
    const label = String(form.get("type"));
    if (!contact) return;
    const transition: Partial<Record<string, Stage>> = { "RDV planifié": "RDV", "Essai réalisé": "Essai", "Inscription client": "Inscrit", "Résiliation": "Résilié" };
    const nextContacts = database.contacts.map((item) => item.id === contact.id ? { ...item, stage: transition[label] ?? item.stage, activity: "À l’instant", next: label === "Résiliation" ? "Suivi résiliation" : item.next } : item);
    const next = { ...database, contacts: nextContacts, events: [{ id: crypto.randomUUID(), date: "À l’instant", label, contact: contact.name, detail: String(form.get("note")) || "Airtable, Brevo, WhatsApp et Make mis à jour" }, ...database.events] };
    commit(next, `${label} enregistré pour ${contact.name}`);
    setEventOpen(false);
  };

  const createContact = (form: FormData) => {
    const name = String(form.get("name")).trim();
    const email = String(form.get("email")).trim();
    if (!name || !email) return;
    const contact: Contact = { id: crypto.randomUUID(), name, email, phone: String(form.get("phone")), source: String(form.get("source")) || "Saisie interne", stage: "Prospect", next: "Qualifier le besoin", activity: "À l’instant" };
    commit({ ...database, contacts: [contact, ...database.contacts], events: [{ id: crypto.randomUUID(), date: "À l’instant", label: "Nouveau prospect", contact: name, detail: "Contact enregistré et synchronisé" }, ...database.events] }, `${name} est ajouté au CRM`);
    setContactOpen(false);
  };

  const advanceContact = (contact: Contact) => {
    const index = stages.indexOf(contact.stage);
    const nextStage = stages[Math.min(index + 1, stages.length - 1)];
    if (nextStage === contact.stage) return;
    commit({ ...database, contacts: database.contacts.map((item) => item.id === contact.id ? { ...item, stage: nextStage, activity: "À l’instant" } : item), events: [{ id: crypto.randomUUID(), date: "À l’instant", label: `Passage en ${nextStage}`, contact: contact.name, detail: "Parcours client mis à jour" }, ...database.events] }, `${contact.name} passe en ${nextStage}`);
  };
  const moveContact = (contactId: string, stage: Stage) => {
    const contact = database.contacts.find((item) => item.id === contactId);
    if (!contact || contact.stage === stage) return;
    commit({ ...database, contacts: database.contacts.map((item) => item.id === contactId ? { ...item, stage, activity: "À l’instant" } : item), events: [{ id: crypto.randomUUID(), date: "À l’instant", label: `Parcours mis à jour · ${stage}`, contact: contact.name, detail: "Déplacement manuel dans le pipeline commercial" }, ...database.events] }, `${contact.name} est déplacé vers ${stage}`);
  };

  const runAutomation = (automation: Automation) => {
    commit({ ...database, automations: database.automations.map((item) => item.id === automation.id ? { ...item, lastRun: "À l’instant" } : item), events: [{ id: crypto.randomUUID(), date: "À l’instant", label: "Automatisation exécutée", contact: automation.service, detail: automation.name }, ...database.events] }, `${automation.service} a exécuté le scénario`);
  };

  const toggleAutomation = (automation: Automation) => {
    const status = automation.status === "Actif" ? "En pause" : "Actif";
    commit({ ...database, automations: database.automations.map((item) => item.id === automation.id ? { ...item, status } : item) }, `${automation.name} est ${status.toLowerCase()}`);
  };

  const createProgram = (form: FormData) => {
    const client = String(form.get("client"));
    const goal = String(form.get("goal"));
    const frequency = String(form.get("frequency"));
    if (!client || !goal || !frequency) return;
    const program: Program = { id: crypto.randomUUID(), client, goal, frequency, status: "À valider", createdAt: "À l’instant" };
    commit({ ...database, programs: [program, ...database.programs], events: [{ id: crypto.randomUUID(), date: "À l’instant", label: "Programme généré", contact: client, detail: `${goal} · ${frequency} · ${selectedExerciseIds.length} exercices sélectionnés` }, ...database.events] }, `Programme brouillon créé pour ${client}`);
  };

  const validateProgram = (program: Program) => {
    commit({ ...database, programs: database.programs.map((item) => item.id === program.id ? { ...item, status: "Validé" } : item), events: [{ id: crypto.randomUUID(), date: "À l’instant", label: "Programme validé", contact: program.client, detail: "Email Brevo prêt à être envoyé" }, ...database.events] }, `Programme validé pour ${program.client}`);
  };

  const toggleExercise = (exerciseId: string) => {
    setSelectedExerciseIds((current) => current.includes(exerciseId) ? current.filter((id) => id !== exerciseId) : [...current, exerciseId]);
  };

  const logWorkout = () => {
    const session: WorkoutSession = { id: crypto.randomUUID(), client: sessionClient, date: "À l’instant", label: "Séance personnalisée", duration: `${38 + selectedExerciseIds.length * 4} min`, completion: 100, volume: `${(selectedExerciseIds.length * 720).toLocaleString("fr-FR")} kg` };
    commit({ ...database, workouts: [session, ...database.workouts], events: [{ id: crypto.randomUUID(), date: "À l’instant", label: "Séance enregistrée", contact: sessionClient, detail: `${selectedExerciseIds.length} exercices · ${session.duration} · ${session.volume}` }, ...database.events] }, `Séance enregistrée pour ${sessionClient}`);
  };

  const createFinance = (form: FormData) => {
    const amount = Number(form.get("amount"));
    if (!amount) return;
    const entry: FinanceItem = { id: crypto.randomUUID(), month: "2026-08", type: String(form.get("type")) as FinanceItem["type"], category: String(form.get("category")), amount };
    commit({ ...database, finance: [entry, ...database.finance] }, `${entry.type} de ${euro(amount)} enregistré`);
  };

  const resetDemo = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setDatabase(initialDatabase);
    setNotice("Démonstration réinitialisée");
  };

  const Overview = () => <>
    <section className="crm-page-head"><div><h1>Tableau de bord CRM</h1><p>21 juil. 2026 – 17 août 2026</p></div><div><button className="button outline" onClick={() => setNotice("Rapport mensuel téléchargé")}>Télécharger</button><button className="button" onClick={() => setEventOpen(true)}>Ajouter un membre</button></div></section>
    <section className="target-card"><div><h2>L’objectif mensuel est en cours</h2><p>Vous avez atteint 48 % de l’objectif d’abonnements. Suivez les essais et les relances pour maintenir le rythme.</p><button className="text-button" onClick={() => setActiveView("Finance")}>Consulter les performances →</button></div><div className="target-progress"><b>48<span>%</span></b><div><i /></div><small>96 / 200 nouveaux membres</small></div></section>
    <section className="metrics"><Metric label="Membres actifs" value="1 890" change="+10,4 % ce mois" /><Metric label="Essais en cours" value="130" change="-0,8 % ce mois" /><Metric label="CA total" value={euro(turnover)} change="+20,1 % ce mois" /><Metric label="Présence moyenne" value="78 %" change="+4,6 % ce mois" /></section>
    <section className="analytics-grid"><Panel title="Tendance du club" detail="CA et présence · 21 juil. — 17 août"><PerformanceChart /></Panel><Panel title="Activité cette semaine" detail="Les signaux qui méritent votre attention"><div className="activity-stats"><article><span className="activity-icon revenue">↗</span><div><b>18 460 €</b><small>CA généré</small></div><em>+20,1 %</em></article><article><span className="activity-icon attendance">◎</span><div><b>78,4 %</b><small>Taux de présence</small></div><em>+4,6 %</em></article><article><span className="activity-icon trials">✦</span><div><b>14</b><small>Essais planifiés</small></div><em>+3</em></article></div></Panel></section>
    <section className="crm-split"><Panel title="Sources des prospects" detail="Répartition des nouveaux contacts"><div className="source-breakdown">{[["Instagram",275,"instagram"],["Email",200,"email"],["Appels",287,"calls"],["Parrainage",173,"other"]].map(([label,value,kind]) => <div key={String(label)}><span><i className={String(kind)} />{label}</span><b>{value}</b><em><i style={{ width: `${Math.round((Number(value) / 287) * 100)}%` }} /></em></div>)}</div></Panel><Panel title="Tâches" detail="Suivez les prochaines actions de l’équipe"><div className="task-list">{[["Confirmer les essais de la semaine","Appeler les membres avant 18 h","Priorité haute"],["Préparer le bilan coach","Mettre à jour les objectifs de septembre","Priorité moyenne"],["Relancer les anciens membres","Envoyer la campagne de réactivation","Priorité basse"]].map(([title,detail,priority]) => <button key={title} onClick={() => setNotice(`${title} est marqué comme terminé`)}><span /><div><b>{title}</b><small>{detail}</small></div><em>{priority}</em></button>)}</div></Panel></section>
    <section className="crm-split"><Panel title="Pipeline commercial" detail="Parcours des prospects et des membres"><div className="pipeline-list">{stages.slice(0, 4).map((stage, index) => <button key={stage} onClick={() => setActiveView("Parcours")}><span><b>{stage}</b><small>{[235,146,84,36][index]} contacts · {euro([420500,267800,192400,87200][index])}</small></span><i><em style={{ width: `${[38,24,18,8][index]}%` }} /></i><strong>{[38,24,18,8][index]}%</strong></button>)}</div></Panel><Panel title="Actions de l’agent" detail="Recommandations issues des signaux CRM"><div className="agent-task-list"><button onClick={() => setActiveView("Agent IA")}><b>Relancer 3 essais à risque</b><span>Messages WhatsApp prêts à valider</span></button><button onClick={() => setActiveView("Campagnes")}><b>Réactiver 42 anciens membres</b><span>Campagne segmentée recommandée</span></button><button onClick={() => setActiveView("Programmes")}><b>Valider le programme de Clara</b><span>Contrôle coach requis avant l’envoi</span></button></div></Panel></section>
    <section className="panel"><div className="panel-head"><div><h2>Membres récents</h2><p>Les dernières fiches actives dans le CRM.</p></div><button className="button outline small" onClick={() => setActiveView("Contacts")}>Voir tous les membres</button></div><div className="table-wrap"><table><thead><tr><th>Nom</th><th>Statut</th><th>Email</th><th>Prochaine action</th><th>Valeur</th></tr></thead><tbody>{database.contacts.slice(0, 5).map((contact, index) => <tr key={contact.id}><td><span className="person"><i>{initials(contact.name)}</i>{contact.name}</span></td><td><span className={`tag ${stageClass(contact.stage)}`}>{contact.stage}</span></td><td>{contact.email}</td><td>{contact.next}</td><td><b>{euro([316,242,837,874,721][index] || 0)}</b></td></tr>)}</tbody></table></div></section>
  </>;

  const Contacts = () => <>
    <section className="welcome compact"><div><h1>Contacts</h1><p>Une fiche unique par prospect ou client. Les actions modifient le parcours et le journal.</p></div><button className="button" onClick={() => setContactOpen(true)}>＋ Ajouter un contact</button></section>
    <section className="filter-row"><button className={contactFilter === "Tous" ? "filter active" : "filter"} onClick={() => setContactFilter("Tous")}>Tous ({database.contacts.length})</button>{stages.map((stage) => <button className={contactFilter === stage ? "filter active" : "filter"} key={stage} onClick={() => setContactFilter(stage)}>{stage} ({contactsByStage(stage).length})</button>)}</section>
    <section className="panel"><div className="table-wrap"><table><thead><tr><th>Contact</th><th>Coordonnées</th><th>Statut</th><th>Prochaine étape</th><th>Source</th><th>Action</th></tr></thead><tbody>{database.contacts.filter((contact) => contactFilter === "Tous" || contact.stage === contactFilter).map((contact) => <tr key={contact.id}><td><span className="person"><i>{initials(contact.name)}</i>{contact.name}</span></td><td><small>{contact.email}<br />{contact.phone}</small></td><td><span className={`tag ${stageClass(contact.stage)}`}>{contact.stage}</span></td><td>{contact.next}</td><td>{contact.source}</td><td><button className="button outline small" onClick={() => advanceContact(contact)}>Avancer →</button></td></tr>)}</tbody></table></div></section>
  </>;

  const Journey = () => <>
    <section className="welcome compact"><div><h1>Parcours client</h1><p>Déplace chaque contact dans son étape. Une action déclenche aussi l’historique d’automatisation.</p></div><button className="button outline" onClick={() => setEventOpen(true)}>Créer un événement</button></section>
    <section className="journey-board">{stages.map((stage) => <div className="journey-column" key={stage} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); moveContact(event.dataTransfer.getData("contact-id"), stage); }}><header><span className={`tag ${stageClass(stage)}`}>{stage}</span><b>{contactsByStage(stage).length}</b></header><div className="journey-cards">{contactsByStage(stage).map((contact) => <article className="journey-card" draggable key={contact.id} onDragStart={(event) => event.dataTransfer.setData("contact-id", contact.id)}><span className="person"><i>{initials(contact.name)}</i>{contact.name}</span><small>{contact.source}</small><p>{contact.next}</p><div className="journey-actions"><select value={contact.stage} onChange={(event) => moveContact(contact.id, event.target.value as Stage)} aria-label={`Déplacer ${contact.name}`}><option>Prospect</option><option>RDV</option><option>Essai</option><option>Inscrit</option><option>Résilié</option></select>{stage !== "Résilié" && <button className="text-button" onClick={() => advanceContact(contact)}>Avancer →</button>}</div></article>)}{contactsByStage(stage).length === 0 && <p className="empty">Déposez un contact ici</p>}</div></div>)}</section>
  </>;

  const AutomationView = () => <>
    <section className="welcome compact"><div><h1>Automatisations</h1><p>Le tableau montre les connecteurs, leur dernière activité et les actions exécutables.</p></div><button className="button outline" onClick={() => setEventOpen(true)}>Tester avec un événement</button></section>
    <section className="automation-grid">{database.automations.map((automation) => <article className="automation-card" key={automation.id}><div className="automation-card-title"><span className={`service ${serviceClass(automation.service)}`}><Image src={serviceLogo(automation.service)} alt="" width={18} height={18} /></span><div><h2>{automation.service}</h2><p>{automation.name}</p></div><span className={automation.status === "Actif" ? "state active" : "state"}>{automation.status}</span></div><div className="automation-meta"><span>Dernière exécution</span><b>{automation.lastRun}</b></div><div className="card-actions"><button className="button outline" onClick={() => toggleAutomation(automation)}>{automation.status === "Actif" ? "Mettre en pause" : "Activer"}</button><button className="button" onClick={() => runAutomation(automation)}>Lancer maintenant</button></div></article>)}</section>
    <section className="panel visual-flow"><div className="panel-head"><div><h2>Scénario visuel</h2><p>Nouveau RDV depuis la page de capture.</p></div><button className="button outline" onClick={() => setNotice("Scénario exécuté : contact, segment et rappel créés")}>Exécuter le test</button></div><div className="flow-canvas"><span className="flow-node airtable">Airtable</span><i>→</i><span className="flow-node brevo">Brevo</span><i>→</i><span className="flow-node whatsapp">WhatsApp</span></div></section>
    <section className="panel"><div className="panel-head"><div><h2>Journal des actions</h2><p>Chaque scénario génère une ligne consultable.</p></div></div><Timeline events={database.events.filter((event) => event.label.includes("Automatisation") || event.detail.includes("Airtable") || event.detail.includes("Brevo")).slice(0, 6)} /></section>
  </>;

  const AgentView = () => <>
    <section className="welcome compact"><div><h1>Agent de croissance</h1><p>Un agent autonome observe les signaux CRM, prépare des actions et garde une trace de chaque décision.</p></div><span className="local-state">● Agent opérationnel</span></section>
    <section className="agent-command"><AgentOrb large /><div className="agent-command-copy"><span className="agent-live">Analyse en continu</span><h2>Priorités commerciales du jour</h2><p>L’agent relie les données de contacts, de rendez-vous et de campagnes pour trouver les meilleures prochaines actions.</p><div className="agent-action"><span>01</span><div><b>Confirmer 3 rendez-vous</b><small>Messages WhatsApp personnalisés prêts.</small></div><button className="button" onClick={() => { setNotice("3 relances WhatsApp préparées par l’agent"); }}>Exécuter</button></div><div className="agent-action"><span>02</span><div><b>Réactiver 2 essais</b><small>Séquence Brevo avec proposition de créneau.</small></div><button className="button outline" onClick={() => { setNotice("Séquence de réactivation prête à valider"); }}>Prévisualiser</button></div><div className="agent-action"><span>03</span><div><b>Valider le programme Clara</b><small>Le coach doit confirmer avant l’envoi.</small></div><button className="button outline" onClick={() => setActiveView("Programmes")}>Ouvrir</button></div></div></section>
    <section className="score-grid"><article><small>Conversion</small><b>86</b><span>Score chaud · Léa Dubois</span></article><article><small>Risque résiliation</small><b>62 %</b><span>À relancer · Thomas Bernard</span></article><article><small>Prochaine action</small><b>18 h</b><span>Meilleur créneau de relance</span></article></section>
    <section className="grid-2"><Panel title="Mémoire agent" detail="Les faits importants, jamais des suppositions"><Timeline events={database.events.slice(0, 5)} /></Panel><Panel title="Garde-fous" detail="Les actions sensibles demandent une validation humaine"><div className="safeguards"><p>✓ Résiliations et réclamations sont escaladées.</p><p>✓ Programmes sportifs passent par le coach.</p><p>✓ Les campagnes utilisent les consentements CRM.</p></div></Panel></section>
  </>;

  const Programs = () => {
    const filteredExercises = exerciseLibrary.filter((exercise) => (exerciseMuscle === "Tous" || exercise.muscle === exerciseMuscle) && `${exercise.name} ${exercise.muscle} ${exercise.equipment}`.toLowerCase().includes(exerciseQuery.toLowerCase()));
    const selectedExercises = exerciseLibrary.filter((exercise) => selectedExerciseIds.includes(exercise.id));
    const clientWorkouts = database.workouts.filter((workout) => workout.client === sessionClient);
    const averageCompletion = clientWorkouts.length ? Math.round(clientWorkouts.reduce((sum, workout) => sum + workout.completion, 0) / clientWorkouts.length) : 0;
    const muscles = ["Tous", ...Array.from(new Set(exerciseLibrary.map((exercise) => exercise.muscle)))];
    return <>
      <section className="crm-page-head"><div><h1>Programmes & suivi</h1><p>Créez des plans sportifs, suivez chaque séance et gardez le coach dans la boucle.</p></div><div><span className="local-state">{validatedPrograms} validé{validatedPrograms > 1 ? "s" : ""}</span></div></section>
      <section className="program-summary"><article><span>Bibliothèque active</span><strong>1 324</strong><small>exercices indexés</small></article><article><span>Séances cette semaine</span><strong>{database.workouts.length + 5}</strong><small>+18 % vs. semaine passée</small></article><article><span>Adhérence moyenne</span><strong>86 %</strong><small>sur les membres suivis</small></article><article className="program-summary-accent"><span>Programmes validés</span><strong>{validatedPrograms}</strong><small>prêts à envoyer par Brevo</small></article></section>
      <nav className="program-tabs" aria-label="Espaces programmes"><button className={programTab === "builder" ? "active" : ""} onClick={() => setProgramTab("builder")}>✦ Créateur</button><button className={programTab === "library" ? "active" : ""} onClick={() => setProgramTab("library")}>▦ Bibliothèque</button><button className={programTab === "progress" ? "active" : ""} onClick={() => setProgramTab("progress")}>↗ Progression</button></nav>
      {programTab === "builder" && <>
        <section className="program-builder-grid"><form className="panel program-questionnaire" action={createProgram}><div className="panel-head"><div><span className="eyebrow">ÉTAPE 01 · PROFIL</span><h2>Questionnaire client</h2><p>Le plan s’adapte à l’objectif et au niveau du membre.</p></div></div><label>Client<select name="client" required><option value="">Choisir un client</option>{database.contacts.filter((contact) => contact.stage === "Inscrit" || contact.stage === "Essai").map((contact) => <option key={contact.id}>{contact.name}</option>)}</select></label><label>Objectif<select name="goal" required><option value="">Choisir un objectif</option><option>Prise de masse</option><option>Perte de poids</option><option>Reprise sportive</option><option>Préparation événement</option></select></label><label>Fréquence<select name="frequency" required><option value="">Choisir la fréquence</option><option>2 séances / semaine</option><option>3 séances / semaine</option><option>4 séances / semaine</option></select></label><div className="program-selected"><div><b>Exercices sélectionnés</b><small>{selectedExercises.length} mouvements dans le brouillon</small></div><button type="button" className="text-button" onClick={() => setProgramTab("library")}>Modifier →</button><div className="program-selected-list">{selectedExercises.map((exercise) => <span key={exercise.id}>{exercise.name}<button type="button" aria-label={`Retirer ${exercise.name}`} onClick={() => toggleExercise(exercise.id)}>×</button></span>)}</div></div><div className="notice"><b>Validation coach requise</b><span>Une fois validé, le programme est prêt à être envoyé par email.</span></div><button className="button" type="submit">Générer le brouillon ↗</button></form><section className="program-live-preview"><div className="program-preview-top"><div><span className="eyebrow">APERÇU DU PROGRAMME</span><h2>{sessionClient}</h2><p>Reprise sportive · 3 séances / semaine</p></div><span className="program-preview-status">Brouillon</span></div><div className="program-week"><article><span>LUN</span><b>Haut du corps</b><small>{selectedExercises.slice(0, 2).map((exercise) => exercise.name).join(" · ") || "Choisir des exercices"}</small><em>45 min</em></article><article><span>MER</span><b>Full body</b><small>{selectedExercises.slice(1, 3).map((exercise) => exercise.name).join(" · ") || "Choisir des exercices"}</small><em>38 min</em></article><article><span>VEN</span><b>Conditionnement</b><small>{selectedExercises.slice(2, 4).map((exercise) => exercise.name).join(" · ") || "Choisir des exercices"}</small><em>32 min</em></article></div><div className="program-preview-footer"><span><b>{selectedExercises.length}</b> exercices</span><span><b>3</b> séances</span><span><b>115</b> min / semaine</span></div></section></section>
        <section className="panel program-queue"><div className="panel-head"><div><h2>File de validation</h2><p>Les programmes générés restent modifiables avant transmission.</p></div><button className="button outline small" onClick={() => setProgramTab("progress")}>Voir les séances</button></div><div className="program-list">{database.programs.map((program) => <article className="program-card" key={program.id}><div><span className={`tag ${program.status === "Validé" ? "inscrit" : "neutral"}`}>{program.status}</span><h2>{program.client}</h2><p>{program.goal} · {program.frequency}</p><small>Créé {program.createdAt}</small></div>{program.status === "À valider" ? <button className="button" onClick={() => validateProgram(program)}>Valider et préparer l’email</button> : <span className="sent">✓ Prêt à envoyer</span>}</article>)}</div></section>
      </>}
      {programTab === "library" && <section className="panel exercise-library"><div className="panel-head exercise-library-head"><div><span className="eyebrow">CATALOGUE FITNESS</span><h2>Bibliothèque d’exercices</h2><p>Ajoutez des mouvements au brouillon de {sessionClient}.</p></div><span className="library-count">{filteredExercises.length} résultats</span></div><div className="exercise-filters"><label className="exercise-search">⌕<input value={exerciseQuery} onChange={(event) => setExerciseQuery(event.target.value)} placeholder="Rechercher un exercice" aria-label="Rechercher un exercice" /></label><select value={exerciseMuscle} onChange={(event) => setExerciseMuscle(event.target.value)} aria-label="Filtrer par groupe musculaire">{muscles.map((muscle) => <option key={muscle}>{muscle}</option>)}</select><button className="button outline" onClick={() => setProgramTab("builder")}>Retour au créateur</button></div><div className="exercise-grid">{filteredExercises.map((exercise) => { const selected = selectedExerciseIds.includes(exercise.id); return <article className={`exercise-card ${selected ? "selected" : ""}`} key={exercise.id}><div className="exercise-card-art"><span>{exercise.muscle.slice(0, 2).toUpperCase()}</span><b>{selected ? "Ajouté" : exercise.level}</b></div><div className="exercise-card-copy"><div><h3>{exercise.name}</h3><small>{exercise.equipment} · {exercise.muscle}</small></div><p>{exercise.cue}</p><footer><span>{exercise.prescription}</span><button className={selected ? "selected-action" : ""} onClick={() => toggleExercise(exercise.id)}>{selected ? "Retirer" : "Ajouter"} {selected ? "×" : "+"}</button></footer></div></article>; })}</div></section>}
      {programTab === "progress" && <><section className="progress-layout"><section className="panel progress-overview"><div className="panel-head"><div><h2>Progression membre</h2><p>La régularité de {sessionClient} sur les quatre dernières semaines.</p></div><select value={sessionClient} onChange={(event) => setSessionClient(event.target.value)} aria-label="Choisir un membre">{database.contacts.filter((contact) => contact.stage === "Inscrit" || contact.stage === "Essai").map((contact) => <option key={contact.id}>{contact.name}</option>)}</select></div><div className="progress-score"><div><span>Adhérence</span><strong>{averageCompletion || 86}%</strong><small>objectif : 80 %</small></div><div className="progress-ring"><i style={{ "--progress": `${averageCompletion || 86}%` } as React.CSSProperties} /></div><div><span>Volume total</span><strong>12 140 kg</strong><small>+8,4 % ce mois</small></div></div><div className="progress-chart"><div className="progress-chart-grid"><i style={{ height: "48%" }} /><i style={{ height: "62%" }} /><i style={{ height: "54%" }} /><i style={{ height: "76%" }} /><i style={{ height: "84%" }} /><i style={{ height: "92%" }} /></div><div className="progress-chart-labels"><span>21 juil.</span><span>28 juil.</span><span>4 août</span><span>11 août</span><span>17 août</span><span>Aujourd’hui</span></div></div></section><section className="panel workout-recorder"><div className="panel-head"><div><span className="eyebrow">SESSION RAPIDE</span><h2>Enregistrer une séance</h2><p>Le suivi met à jour la fiche contact.</p></div></div><label>Membre<select value={sessionClient} onChange={(event) => setSessionClient(event.target.value)}>{database.contacts.filter((contact) => contact.stage === "Inscrit" || contact.stage === "Essai").map((contact) => <option key={contact.id}>{contact.name}</option>)}</select></label><div className="recorder-stats"><span><b>{selectedExerciseIds.length}</b> exercices prêts</span><span><b>38 min</b> durée estimée</span></div><button className="button" onClick={logWorkout}>✓ Marquer la séance terminée</button></section></section><section className="panel workout-history"><div className="panel-head"><div><h2>Historique des séances</h2><p>Les dernières séances synchronisées dans Airtable.</p></div><span className="tag inscrit">Synchronisé</span></div><div className="workout-history-list">{database.workouts.map((workout) => <article key={workout.id}><span className="workout-history-icon">↗</span><div><b>{workout.label}</b><small>{workout.client} · {workout.date}</small></div><span><b>{workout.duration}</b><small>{workout.volume}</small></span><strong>{workout.completion}%</strong></article>)}</div></section></>}
      <section className="client-portal"><div><span>ESPACE CLIENT</span><h2>Programme, séances et feedback réunis</h2><p>Chaque membre retrouve ses exercices, ses objectifs et ses documents depuis un lien privé.</p></div><div className="portal-actions"><b>{sessionClient} · {averageCompletion || 86}% d’adhérence</b><button className="button outline" onClick={() => setNotice(`Lien d’espace client préparé pour ${sessionClient}`)}>Ouvrir l’espace client</button></div></section>
    </>;
  };

  const Finance = () => <>
    <section className="welcome compact"><div><h1>Finance</h1><p>Le pilotage mensuel regroupe le chiffre d’affaires, les charges et le bénéfice brut.</p></div><span className="local-state">Août 2026</span></section>
    <section className="metrics financial"><Metric label="CA mensuel" value={euro(turnover)} change="Abonnements et ventes" /><Metric label="Charges" value={euro(expenses)} change="Loyer, salaires, publicité" /><Metric label="Bénéfice brut" value={euro(turnover - expenses)} change={`${Math.round(((turnover - expenses) / turnover) * 100)} % de marge`} /><Metric label="Objectif mensuel" value="22 000 €" change={`${Math.round((turnover / 22000) * 100)} % atteint`} /></section>
    <section className="finance-layout"><form className="panel form-panel" action={createFinance}><div className="panel-head"><div><h2>Nouvelle ligne financière</h2><p>Les totaux se recalculent immédiatement.</p></div></div><label>Type<select name="type"><option>CA</option><option>Charge</option></select></label><label>Catégorie<input name="category" placeholder="Ex. Publicité" required /></label><label>Montant (€)<input name="amount" type="number" min="1" placeholder="0" required /></label><button className="button" type="submit">Enregistrer la ligne</button></form><section className="panel"><div className="table-wrap"><table><thead><tr><th>Type</th><th>Catégorie</th><th>Mois</th><th>Montant</th></tr></thead><tbody>{currentFinance.map((entry) => <tr key={entry.id}><td><span className={entry.type === "CA" ? "tag inscrit" : "tag prospect"}>{entry.type}</span></td><td>{entry.category}</td><td>Août 2026</td><td><b>{euro(entry.amount)}</b></td></tr>)}</tbody></table></div></section></section>
    <section className="forecast"><div><span>PRÉVISION IA</span><h2>22 840 € estimés à fin août</h2><p>Trajectoire à +840 € de l’objectif, portée par les essais en conversion et les réactivations.</p></div><div className="forecast-bars"><i style={{ height: "46%" }} /><i style={{ height: "61%" }} /><i style={{ height: "72%" }} /><i style={{ height: "88%" }} /><i className="projected" style={{ height: "96%" }} /></div></section>
  </>;

  const Inbox = () => <>
    <section className="welcome compact"><div><h1>Inbox omnicanale</h1><p>Emails, WhatsApp et Instagram réunis au même endroit, avec le contexte CRM de chaque conversation.</p></div><button className="button" onClick={() => setNotice("Réponse commerciale préparée par l’agent")}>✦ Préparer une réponse</button></section>
    <section className="inbox-layout"><section className="panel inbox-list"><div className="panel-head"><div><h2>Conversations actives</h2><p>3 demandes nécessitent une action.</p></div></div>{[["WhatsApp","Léa Dubois","Peut-on décaler le RDV à jeudi ?","Il y a 4 min"],["Email","Thomas Bernard","Quel abonnement choisir pour une reprise ?","Il y a 18 min"],["Instagram","Julien Moreau","Je souhaite faire une séance d’essai.","Il y a 32 min"]].map(([channel,name,message,time]) => <button className="thread" key={name} onClick={() => setNotice(`Conversation ${channel} ouverte pour ${name}`)}><span className={`channel ${channel.toLowerCase()}`}>{channel === "WhatsApp" ? "◉" : channel === "Email" ? "✉" : "◎"}</span><span><b>{name}</b><small>{message}</small></span><em>{time}</em></button>)}</section><section className="panel conversation"><div className="panel-head"><div><h2>Léa Dubois <span className="tag inscrit">Score 86</span></h2><p>RDV · Source site web · Consentement WhatsApp</p></div></div><div className="conversation-body"><p>Bonjour, peut-on décaler le RDV à jeudi ?</p><p className="reply">Bonjour Léa, jeudi à 18 h est disponible. Je vous le réserve ?</p><div className="suggestions"><button onClick={() => setNotice("Réponse WhatsApp envoyée à Léa")}>Envoyer la réponse</button><button onClick={() => setNotice("Créneau proposé dans l’agenda")}>Proposer un créneau</button></div></div></section></section>
  </>;

  const Agenda = () => <>
    <section className="welcome compact"><div><h1>Agenda intelligent</h1><p>Rendez-vous, disponibilités coachs et relances no-show sont orchestrés depuis le CRM.</p></div><button className="button" onClick={() => setEventOpen(true)}>＋ Planifier un RDV</button></section>
    <section className="agenda-grid"><Panel title="Aujourd’hui · mardi 13 août" detail="3 créneaux à confirmer"><div className="schedule">{[["09:30","Léa Dubois","Visite studio","confirmé"],["12:15","Thomas Bernard","Séance d’essai","pending"],["18:00","Sophie Renaud","Bilan objectifs","confirmed"]].map(([time,name,kind,status]) => <article key={time}><time>{time}</time><div><b>{name}</b><small>{kind}</small></div><span className={status === "pending" ? "tag rdv" : "tag inscrit"}>{status === "pending" ? "À confirmer" : "Confirmé"}</span></article>)}</div></Panel><Panel title="Prévention no-show" detail="L’agent détecte les rendez-vous à risque"><div className="risk-card"><span>Risque modéré · 62 %</span><h2>Thomas Bernard</h2><p>Pas de réponse depuis 18 h. Un rappel WhatsApp personnalisé est prêt.</p><button className="button" onClick={() => setNotice("Rappel WhatsApp envoyé à Thomas")}>Envoyer le rappel</button></div></Panel></section>
  </>;

  const Campaigns = () => <>
    <section className="welcome compact"><div><h1>Campagnes segmentées</h1><p>Crée des audiences comportementales, prévisualise les messages et mesure la conversion.</p></div><button className="button" onClick={() => setNotice("Campagne enregistrée et prête à partir")}>Enregistrer la campagne</button></section>
    <section className="campaign-layout"><section className="panel campaign-builder"><div className="panel-head"><div><h2>Réactivation · essais inactifs</h2><p>Segment recommandé par l’agent.</p></div></div><div className="segment-chips"><span>Essai réalisé</span><span>Sans réservation depuis 7 jours</span><span>Consentement email</span></div><div className="audience"><b>42 contacts</b><small>Portée estimée · 68 % d’ouverture</small></div><button className="button" onClick={() => setNotice("Aperçu Brevo généré pour 42 contacts")}>Générer l’aperçu</button></section><section className="panel message-preview"><div className="panel-head"><div><h2>Aperçu du message</h2><p>Brevo · Email personnalisé</p></div></div><div className="email-card"><small>Objet</small><b>Prêt(e) à reprendre là où vous vous êtes arrêté(e) ?</b><p>Bonjour Thomas, votre séance d’essai est terminée. L’agent a réservé des créneaux adaptés à votre objectif.</p><button className="button outline" onClick={() => setNotice("Campagne envoyée en simulation")}>Envoyer à l’audience</button></div></section></section>
  </>;

  let content: React.ReactNode = <Overview />;
  if (activeView === "Contacts") content = <Contacts />;
  if (activeView === "Parcours") content = <Journey />;
  if (activeView === "Agent IA") content = <AgentView />;
  if (activeView === "Inbox") content = <Inbox />;
  if (activeView === "Agenda") content = <Agenda />;
  if (activeView === "Automatisations") content = <AutomationView />;
  if (activeView === "Campagnes") content = <Campaigns />;
  if (activeView === "Programmes") content = <Programs />;
  if (activeView === "Finance") content = <Finance />;

  const pickMobileView = (view: View) => { setActiveView(view); setMobileMoreOpen(false); };
  return <div className="shell"><aside className="sidebar"><div className="brand"><Image src="/fitflow-logo.png" alt="FitFlow" width={44} height={44} priority /><div><b>FitFlow CRM</b><small>Command center</small></div></div><nav>{views.map((view) => <button key={view.name} className={activeView === view.name ? "nav active" : "nav"} onClick={() => setActiveView(view.name)}><span>{view.icon}</span>{view.name}</button>)}</nav><div className="side-actions"><button className="nav" onClick={() => setChatOpen(true)}><span>◌</span>Assistant CRM</button><button className="nav" onClick={resetDemo}><span>↺</span>Réinitialiser l’espace</button></div></aside><main><header className="topbar"><div className="mobile-brand"><Image src="/fitflow-logo.png" alt="FitFlow" width={32} height={32} priority /><b>FitFlow CRM</b></div><div className="top-actions"><button className="button outline" onClick={() => setChatOpen(true)}>◌ Assistant</button><button className="button" onClick={() => setEventOpen(true)}>＋ Nouvel événement</button></div></header><div className="content">{content}</div><nav className="mobile-nav">{views.slice(0, 4).map((view) => <button key={view.name} className={activeView === view.name ? "active" : ""} onClick={() => pickMobileView(view.name)}><span>{view.icon}</span>{view.name.replace("Vue d’ensemble", "Accueil")}</button>)}<button className={mobileMoreOpen ? "active" : ""} onClick={() => setMobileMoreOpen(true)}><span>☰</span>Plus</button></nav></main>{mobileMoreOpen && <MobileMoreMenu views={views.slice(4)} activeView={activeView} onPick={pickMobileView} onClose={() => setMobileMoreOpen(false)} />}{eventOpen && <EventModal contacts={database.contacts} onClose={() => setEventOpen(false)} onSubmit={createEvent} />}{contactOpen && <ContactModal onClose={() => setContactOpen(false)} onSubmit={createContact} />}{chatOpen && <ChatModal onClose={() => setChatOpen(false)} onCreate={() => { setEventOpen(true); setChatOpen(false); }} />}</div>;
}

function Metric({ label, value, change }: { label: string; value: string; change: string }) { return <article className="metric"><small>{label}</small><strong>{value}</strong><span>↗ {change}</span></article>; }
function PerformanceChart() { return <div className="performance-chart"><div className="chart-legend"><span><i className="legend-revenue" />Chiffre d’affaires</span><span><i className="legend-attendance" />Présence</span><b>18 460 €</b></div><svg viewBox="0 0 760 238" role="img" aria-label="Évolution du chiffre d’affaires et de la présence sur quatre semaines" preserveAspectRatio="none"><defs><linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#18181b" stopOpacity=".12" /><stop offset="1" stopColor="#18181b" stopOpacity="0" /></linearGradient></defs><path className="chart-gridline" d="M0 42H760M0 94H760M0 146H760M0 198H760" /><path className="revenue-area" d="M0 178 C70 168 82 142 150 154 S236 105 310 126 S392 82 458 104 S545 61 615 78 S700 36 760 52 V238 H0Z" /><path className="revenue-line" d="M0 178 C70 168 82 142 150 154 S236 105 310 126 S392 82 458 104 S545 61 615 78 S700 36 760 52" /><path className="attendance-line" d="M0 190 C75 183 92 172 150 175 S244 145 310 160 S396 132 458 144 S546 119 615 132 S704 100 760 112" /><g className="chart-dots"><circle cx="150" cy="154" r="4" /><circle cx="310" cy="126" r="4" /><circle cx="458" cy="104" r="4" /><circle cx="615" cy="78" r="4" /><circle cx="760" cy="52" r="4" /></g></svg><div className="chart-labels"><span>21 juil.</span><span>28 juil.</span><span>4 août</span><span>11 août</span><span>17 août</span></div></div>; }
function Panel({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) { return <section className="panel"><div className="panel-head"><div><h2>{title}</h2><p>{detail}</p></div></div>{children}</section>; }
function Timeline({ events }: { events: EventItem[] }) { return <div className="timeline">{events.length ? events.map((event) => <article key={event.id}><span className="timeline-dot" /><div><small>{event.date}</small><b>{event.label} · {event.contact}</b><p>{event.detail}</p></div></article>) : <p className="empty">Aucune action pour le moment.</p>}</div>; }
function ProgramPreview({ program, onValidate }: { program?: Program; onValidate: (program: Program) => void }) { if (!program) return <div className="empty padded">Tous les programmes sont validés.</div>; return <div className="preview"><div><span className="tag neutral">À valider</span><h2>{program.client}</h2><p>{program.goal} · {program.frequency}</p></div><ul><li>LUN · Haut du corps — Force</li><li>MAR · Bas du corps — Volume</li><li>JEU · Full body — Hypertrophie</li></ul><button className="button" onClick={() => onValidate(program)}>Valider le programme</button></div>; }
function JourneyPulse({ counts, labels }: { counts: number[]; labels: string[] }) { const maximum = Math.max(...counts); return <div className="pulse-journey">{counts.map((count, index) => <div className="pulse-stage" key={labels[index]}><div className="pulse-node"><i style={{ "--size": `${32 + (count / maximum) * 54}%` } as React.CSSProperties}>{count}</i></div><b>{labels[index]}</b><small>{index === 0 ? "Entrées actives" : `${Math.round((count / counts[0]) * 100)} % du flux`}</small>{index < counts.length - 1 && <span className="pulse-link">→</span>}</div>)}</div>; }
function AgentOrb({ large = false }: { large?: boolean }) { const canvasRef = useRef<HTMLCanvasElement>(null); useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const gl = canvas.getContext("webgl"); if (!gl) return; const resize = () => { const rect = canvas.getBoundingClientRect(); canvas.width = Math.max(1, Math.floor(rect.width * devicePixelRatio)); canvas.height = Math.max(1, Math.floor(rect.height * devicePixelRatio)); gl.viewport(0, 0, canvas.width, canvas.height); }; const vertex = gl.createShader(gl.VERTEX_SHADER); const fragment = gl.createShader(gl.FRAGMENT_SHADER); if (!vertex || !fragment) return; gl.shaderSource(vertex, "attribute vec2 p; uniform float t; void main(){ float a=atan(p.y,p.x)+t*.25; float r=length(p)+sin(t+a*3.)*.035; gl_PointSize=7.; gl_Position=vec4(cos(a)*r,sin(a)*r,0.,1.); }"); gl.shaderSource(fragment, "precision mediump float; void main(){ vec2 q=gl_PointCoord-.5; float d=dot(q,q); if(d>.25) discard; gl_FragColor=vec4(.0,.42,.31,1.-d*3.); }"); gl.compileShader(vertex); gl.compileShader(fragment); const program = gl.createProgram(); const buffer = gl.createBuffer(); if (!program || !buffer) return; gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program); gl.useProgram(program); const points = new Float32Array(Array.from({ length: 96 }, (_, index) => { const angle = index * 2.399; const radius = .12 + (index % 19) / 23; return [Math.cos(angle) * radius, Math.sin(angle) * radius]; }).flat()); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW); const position = gl.getAttribLocation(program, "p"); const time = gl.getUniformLocation(program, "t"); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0); let frame = 0; const draw = (stamp: number) => { resize(); gl.clearColor(.97, .995, .985, 1); gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform1f(time, stamp / 1000); gl.drawArrays(gl.POINTS, 0, 96); frame = requestAnimationFrame(draw); }; frame = requestAnimationFrame(draw); return () => cancelAnimationFrame(frame); }, []); return <canvas ref={canvasRef} className={large ? "agent-orb large" : "agent-orb"} aria-label="Visualisation WebGL de l’activité de l’agent" />; }
function EventModal({ contacts, onClose, onSubmit }: { contacts: Contact[]; onClose: () => void; onSubmit: (form: FormData) => void }) { return <Modal title="Nouvel événement" detail="Un événement actualise le parcours et le journal CRM." onClose={onClose}><form action={onSubmit} className="modal-form"><label>Contact<select name="contact" required><option value="">Choisir un contact</option>{contacts.map((contact) => <option value={contact.id} key={contact.id}>{contact.name}</option>)}</select></label><label>Événement<select name="type"><option>RDV planifié</option><option>Essai réalisé</option><option>Inscription client</option><option>Résiliation</option></select></label><label>Note interne<textarea name="note" placeholder="Ex. RDV confirmé par téléphone" /></label><div className="notice"><b>Automatisations prévues</b><span>Airtable, Brevo, WhatsApp et Make sont ajoutés au journal de simulation.</span></div><button className="button" type="submit">Enregistrer l’événement</button></form></Modal>; }
function ContactModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (form: FormData) => void }) { return <Modal title="Ajouter un contact" detail="Le contact devient un prospect et rejoint le parcours." onClose={onClose}><form action={onSubmit} className="modal-form"><label>Nom complet<input name="name" required placeholder="Ex. Chloé Martin" /></label><label>Email<input name="email" type="email" required placeholder="chloe@exemple.fr" /></label><label>Téléphone<input name="phone" placeholder="06 00 00 00 00" /></label><label>Source<select name="source"><option>Site web</option><option>Google</option><option>Instagram</option><option>Parrainage</option><option>Saisie interne</option></select></label><button className="button" type="submit">Créer le prospect</button></form></Modal>; }
function MobileMoreMenu({ views, activeView, onPick, onClose }: { views: { name: View; icon: string }[]; activeView: View; onPick: (view: View) => void; onClose: () => void }) { return <div className="mobile-more-backdrop" onClick={onClose}><section className="mobile-more" onClick={(event) => event.stopPropagation()}><header><div><b>Autres espaces</b><small>Outils de pilotage premium</small></div><button className="icon-button" onClick={onClose}>×</button></header><div>{views.map((view) => <button key={view.name} className={activeView === view.name ? "active" : ""} onClick={() => onPick(view.name)}><span>{view.icon}</span><b>{view.name}</b><i>→</i></button>)}</div></section></div>; }
type ChatChannel = "WhatsApp" | "Email" | "Instagram";
type ChatMessage = { id: string; sender: "member" | "coach" | "agent"; text: string; time: string };
type ChatThread = { id: string; name: string; initials: string; channel: ChatChannel; status: string; lastMessage: string; time: string; unread: number; stage: Stage; messages: ChatMessage[] };

const initialChatThreads: ChatThread[] = [
  { id: "lea", name: "Léa Dubois", initials: "LD", channel: "WhatsApp", status: "En ligne", lastMessage: "Peut-on décaler le RDV à jeudi ?", time: "Il y a 4 min", unread: 2, stage: "RDV", messages: [{ id: "lea-1", sender: "member", text: "Bonjour, peut-on décaler le RDV à jeudi ?", time: "09:42" }, { id: "lea-2", sender: "agent", text: "Je vérifie les disponibilités de l’équipe. Je vous propose un créneau dans un instant.", time: "09:43" }] },
  { id: "thomas", name: "Thomas Bernard", initials: "TB", channel: "Email", status: "Actif il y a 18 min", lastMessage: "Quel abonnement choisir pour une reprise ?", time: "Il y a 18 min", unread: 1, stage: "Essai", messages: [{ id: "thomas-1", sender: "member", text: "Quel abonnement choisir pour une reprise sportive ?", time: "09:25" }, { id: "thomas-2", sender: "coach", text: "Je peux vous orienter vers l’offre Starter et prévoir une séance d’essai.", time: "09:28" }] },
  { id: "julien", name: "Julien Moreau", initials: "JM", channel: "Instagram", status: "Actif il y a 32 min", lastMessage: "Je souhaite faire une séance d’essai.", time: "Il y a 32 min", unread: 0, stage: "Prospect", messages: [{ id: "julien-1", sender: "member", text: "Je souhaite faire une séance d’essai.", time: "09:11" }, { id: "julien-2", sender: "agent", text: "Avec plaisir ! Je peux vous proposer une première séance cette semaine.", time: "09:12" }] },
  { id: "clara", name: "Clara Petit", initials: "CP", channel: "WhatsApp", status: "Actif hier", lastMessage: "Mon programme est-il prêt ?", time: "Hier", unread: 0, stage: "Inscrit", messages: [{ id: "clara-1", sender: "member", text: "Mon programme personnalisé est-il prêt ?", time: "Hier" }, { id: "clara-2", sender: "coach", text: "Il est en validation coach. Je vous préviens dès qu’il est disponible.", time: "Hier" }] },
  { id: "sophie", name: "Sophie Renaud", initials: "SR", channel: "Email", status: "Actif il y a 2 h", lastMessage: "Je confirme ma visite du studio.", time: "Il y a 2 h", unread: 0, stage: "RDV", messages: [{ id: "sophie-1", sender: "member", text: "Je confirme ma visite du studio.", time: "07:50" }, { id: "sophie-2", sender: "agent", text: "Parfait, votre visite est bien enregistrée dans l’agenda.", time: "07:51" }] },
];

function ChatModal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const [threads, setThreads] = useState(initialChatThreads);
  const [selectedId, setSelectedId] = useState("lea");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [newChatChannel, setNewChatChannel] = useState<ChatChannel>("WhatsApp");
  const [mobileDetail, setMobileDetail] = useState(false);
  const selected = threads.find((thread) => thread.id === selectedId) ?? threads[0];
  const filteredThreads = threads.filter((thread) => `${thread.name} ${thread.lastMessage} ${thread.channel}`.toLowerCase().includes(query.toLowerCase()));

  const selectThread = (thread: ChatThread) => {
    setSelectedId(thread.id);
    setMobileDetail(true);
    setThreads((current) => current.map((item) => item.id === thread.id ? { ...item, unread: 0 } : item));
  };
  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !selected) return;
    const reply = text.toLowerCase().includes("rdv") || text.toLowerCase().includes("rendez")
      ? "Je regarde les créneaux disponibles et je vous propose la meilleure option."
      : "Bien reçu. Je l’ajoute au suivi CRM et je prépare la prochaine action pour l’équipe.";
    setThreads((current) => current.map((thread) => thread.id === selected.id ? { ...thread, lastMessage: text, time: "À l’instant", messages: [...thread.messages, { id: crypto.randomUUID(), sender: "coach", text, time: "À l’instant" }, { id: crypto.randomUUID(), sender: "agent", text: reply, time: "À l’instant" }] } : thread));
    setDraft("");
  };
  const startNewChat = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newChatName.trim();
    if (!name) return;
    const initialsValue = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    const id = crypto.randomUUID();
    const thread: ChatThread = { id, name, initials: initialsValue, channel: newChatChannel, status: "Nouveau contact", lastMessage: "Conversation créée", time: "À l’instant", unread: 0, stage: "Prospect", messages: [{ id: crypto.randomUUID(), sender: "agent", text: `Bonjour ${name}, comment puis-je vous aider dans votre parcours sportif ?`, time: "À l’instant" }] };
    setThreads((current) => [thread, ...current]);
    setSelectedId(id);
    setNewChatName("");
    setNewChatOpen(false);
    setMobileDetail(true);
  };

  return <div className="crm-chat-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className={`crm-chat ${mobileDetail ? "mobile-detail" : ""}`} role="dialog" aria-modal="true" aria-label="Assistant CRM">
    <aside className="crm-chat-list">
      <div className="crm-chat-list-head"><div><span className="eyebrow">FITFLOW CRM</span><h2>Messages</h2><p>{threads.length} conversations · {threads.filter((thread) => thread.unread > 0).length} non lues</p></div><div className="crm-chat-head-actions"><button className="icon-button" aria-label="Nouvelle conversation" onClick={() => setNewChatOpen(true)}>＋</button><button className="icon-button" aria-label="Fermer l’assistant" onClick={onClose}>×</button></div></div>
      <label className="crm-chat-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une conversation" aria-label="Rechercher une conversation" /></label>
      <div className="crm-chat-threads">{filteredThreads.map((thread) => <button key={thread.id} className={`crm-chat-thread ${thread.id === selectedId ? "active" : ""}`} onClick={() => selectThread(thread)}><span className={`crm-chat-avatar ${thread.channel.toLowerCase()}`}>{thread.initials}</span><span className="crm-chat-thread-copy"><span><b>{thread.name}</b><time>{thread.time}</time></span><small><i className={`crm-channel-dot ${thread.channel.toLowerCase()}`} />{thread.lastMessage}</small></span>{thread.unread > 0 && <em>{thread.unread}</em>}</button>)}{filteredThreads.length === 0 && <p className="crm-chat-empty">Aucune conversation trouvée.</p>}</div>
      {newChatOpen && <div className="crm-chat-new-layer"><form onSubmit={startNewChat}><div className="crm-chat-new-head"><div><span className="eyebrow">NOUVELLE CONVERSATION</span><h3>Démarrer un échange</h3></div><button type="button" className="icon-button" onClick={() => setNewChatOpen(false)}>×</button></div><label>Nom du contact<input autoFocus value={newChatName} onChange={(event) => setNewChatName(event.target.value)} placeholder="Ex. Camille Martin" required /></label><label>Canal<select value={newChatChannel} onChange={(event) => setNewChatChannel(event.target.value as ChatChannel)}><option>WhatsApp</option><option>Email</option><option>Instagram</option></select></label><button className="button" type="submit">Créer la conversation</button></form></div>}
    </aside>
    <section className="crm-chat-main">
      <header className="crm-chat-main-head"><div className="crm-chat-main-person"><button className="crm-chat-back icon-button" aria-label="Retour aux conversations" onClick={() => setMobileDetail(false)}>←</button><span className={`crm-chat-avatar ${selected.channel.toLowerCase()}`}>{selected.initials}</span><div><h2>{selected.name}</h2><p><i className="online-dot" />{selected.status} · {selected.channel}</p></div></div><div className="crm-chat-head-actions"><button className="button outline small" onClick={onCreate}>＋ Événement</button><button className="icon-button" aria-label="Fermer l’assistant" onClick={onClose}>×</button></div></header>
      <div className="crm-chat-context"><span className={`tag ${stageClass(selected.stage)}`}>{selected.stage}</span><span>Score IA 86</span><button onClick={() => onCreate()}>Voir la fiche contact →</button></div>
      <div className="crm-chat-messages">{selected.messages.map((message) => <article key={message.id} className={`crm-chat-message ${message.sender === "coach" ? "mine" : ""}`}><div className="crm-chat-bubble">{message.sender === "agent" && <span className="crm-chat-agent-label">✦ Agent FitFlow</span>}<p>{message.text}</p><time>{message.time}</time></div></article>)}</div>
      <div className="crm-chat-suggestions"><button onClick={() => setDraft("Je veux confirmer mon prochain rendez-vous")}>Confirmer le RDV</button><button onClick={() => setDraft("Peux-tu me préparer un programme adapté ?")}>Préparer un programme</button><button onClick={() => setDraft("Je souhaite connaître les tarifs")}>Répondre aux tarifs</button></div>
      <form className="crm-chat-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); sendMessage(); } }} placeholder="Écrire un message… (⌘/Ctrl + Entrée pour envoyer)" aria-label="Écrire un message" rows={1} /><div><button type="button" className="icon-button" aria-label="Ajouter une pièce jointe" onClick={() => setDraft((value) => value ? `${value} 📎` : "📎 ")}>⌕</button><button type="submit" className="button" disabled={!draft.trim()}>Envoyer ↗</button></div></form>
    </section>
  </section></div>;
}
function Modal({ title, detail, onClose, children }: { title: string; detail: string; onClose: () => void; children: React.ReactNode }) { return <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-label={title}><header><div><h2>{title}</h2><p>{detail}</p></div><button className="icon-button" onClick={onClose}>×</button></header>{children}</section></div>; }
