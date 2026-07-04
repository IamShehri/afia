import json, random, datetime as dt

random.seed(42)

first = ["Mara","Theo","Amelia","Idris","Hana","Caleb","Sofia","Jonah","Yuki","Diego",
         "Naomi","Omar","Greta","Malik","Elena","Rohan","Clara","Sven","Aisha","Lucas",
         "Priya","Noah","Freya","Tariq","Maya","Felix","Zara","Anton","Leila","Kai",
         "Ingrid","Dev","Nora","Hassan","Cora","Bjorn","Ruth","Eli","Mira","Otto",
         "Selma","Arlo","Vera","Reza","Juno","Milo","Esme","Dara","Ines","Knut"]
last = ["Quinn","Albright","Vasquez","Mensah","Park","Doyle","Romano","Becker","Tanaka","Flores",
        "Okafor","Haddad","Lindqvist","Johnson","Petrova","Kapoor","Bennett","Holm","Rahman","Silva",
        "Nadar","Walsh","Berg","Aziz","Sato","Marlowe","Khan","Novak","Saab","Mercer",
        "Larsen","Iyer","Frost","Yousef","Bishop","Strand","Cohen","Reyes","Volkov","Dahl",
        "Engel","Pereira","Voss","Amari","Castle","Brandt","Ferreira","Osei","Lund","Madsen"]

conditions = [
    ("Type 2 Diabetes","Endocrinology"),("Atrial Fibrillation","Cardiology"),
    ("COPD","Pulmonology"),("Hypertension","Internal Medicine"),
    ("CHF","Cardiology"),("Asthma","Pulmonology"),("Migraine","Neurology"),
    ("CKD Stage 3","Internal Medicine"),("Post-op recovery","Surgery"),
    ("Hypothyroidism","Endocrinology"),("Anemia","Internal Medicine"),
    ("Pneumonia","Pulmonology"),("Epilepsy","Neurology"),("Sepsis (resolving)","Internal Medicine"),
    ("Anticoag monitoring","Cardiology"),("Pre-diabetes","Endocrinology"),
]
statuses = ["active","admitted","observation","discharged","follow-up"]
risks = [("low",18),("moderate",46),("high",74),("critical",91)]
insurers = ["Meridian Health","Aetna","BlueCross","Cigna","UnitedHealth","Kaiser","Self-pay","Medicare"]
wards = ["Ward 4B","Ward 2A","ICU","Telemetry","Clinic — West","Clinic — East","Day Unit","Cardiac Step-down"]
clin = ["c1","c2","c3","c4","c5","c6"]
allergy_pool = ["Penicillin","Sulfa","Latex","Peanuts","Iodine contrast","NKDA","Aspirin","Codeine"]

now = dt.datetime(2026,7,1,9,30)

def iso(d): return d.replace(microsecond=0).isoformat()+"Z"

def vitals_for(risk):
    base_hr = {"low":72,"moderate":84,"high":98,"critical":118}[risk]
    hr = base_hr + random.randint(-6,8)
    spo2 = {"low":99,"moderate":97,"high":94,"critical":90}[risk] + random.randint(-1,1)
    sys = {"low":118,"moderate":132,"high":148,"critical":162}[risk] + random.randint(-6,8)
    dia = int(sys*0.63) + random.randint(-4,4)
    temp = round({"low":36.7,"moderate":37.0,"high":37.8,"critical":38.6}[risk] + random.uniform(-0.2,0.3),1)
    def st(metric_alert):
        return metric_alert
    return [
        {"label":"HR","value":str(hr),"unit":"bpm","trend":random.choice(["up","down","flat"]),
         "state":"alert" if hr>110 else ("watch" if hr>95 else "normal")},
        {"label":"BP","value":f"{sys}/{dia}","unit":"mmHg","trend":random.choice(["up","flat"]),
         "state":"alert" if sys>=160 else ("watch" if sys>=140 else "normal")},
        {"label":"SpO₂","value":str(spo2),"unit":"%","trend":random.choice(["down","flat"]),
         "state":"alert" if spo2<92 else ("watch" if spo2<95 else "normal")},
        {"label":"Temp","value":str(temp),"unit":"°C","trend":random.choice(["up","flat"]),
         "state":"alert" if temp>=38.5 else ("watch" if temp>=37.6 else "normal")},
    ]

flag_msgs = {
    "vitals":["SpO₂ trending down over 3 readings","Tachycardia sustained >30 min","BP above target range"],
    "lab":["Potassium 5.6 mmol/L — recheck advised","HbA1c 9.1% — above goal","Creatinine rising vs baseline"],
    "medication":["Warfarin + new NSAID — interaction","Dose overdue by 2h","Renal dosing review needed"],
    "ai":["AFIA predicts 18% readmission risk","Pattern matches early sepsis criteria","Care-gap: overdue A1c"],
    "admin":["Insurance auth expiring in 2 days","Missing discharge summary","Consent form unsigned"],
}

tl_titles = {
    "visit":"Clinic visit","lab":"Lab panel resulted","note":"Progress note",
    "med":"Medication adjusted","ai":"AFIA insight","admit":"Admitted","message":"Patient message"
}

patients = []
N = 28
for i in range(N):
    fn = random.choice(first); ln = random.choice(last)
    name = f"{fn} {ln}"
    cond, spec = random.choice(conditions)
    rk, score = random.choice(risks)
    score = max(2, min(99, score + random.randint(-8,8)))
    status = random.choice(statuses)
    age = random.randint(19,89)
    sex = random.choice(["F","M","M","F","X"])
    mrn = f"MRN-{4100+i*7:05d}"
    last_seen = now - dt.timedelta(hours=random.randint(1,260))
    has_next = status in ("active","follow-up","observation") or random.random()<0.5
    nxt = now + dt.timedelta(hours=random.randint(2,300)) if has_next else None

    nflags = {"low":random.randint(0,1),"moderate":random.randint(0,2),"high":random.randint(1,3),"critical":random.randint(2,4)}[rk]
    flags=[]
    for f in range(nflags):
        kind = random.choice(list(flag_msgs.keys()))
        sev = rk if random.random()<0.5 else random.choice(["moderate","high"])
        flags.append({"id":f"{mrn}-f{f}","kind":kind,"severity":sev,
                      "message":random.choice(flag_msgs[kind]),
                      "at":iso(now - dt.timedelta(hours=random.randint(0,72)))})

    tl=[]
    ntl = random.randint(4,7)
    for t in range(ntl):
        typ = random.choice(["visit","lab","note","med","ai","message"])
        tl.append({"id":f"{mrn}-t{t}","at":iso(now - dt.timedelta(hours=random.randint(1,720))),
                   "type":typ,"title":tl_titles[typ],
                   "detail":random.choice(["Routine follow-up","Stable, continue plan","Adjusted per protocol","Reviewed by care team","Flagged for review"]),
                   "author":random.choice(["Dr. N. Okafor","Dr. E. Vance","S. Whitfield, NP","AFIA","Dr. P. Nadar"])})
    tl.sort(key=lambda x:x["at"], reverse=True)

    nall = random.randint(0,3)
    allergies = random.sample(allergy_pool, nall) if nall else ["NKDA"]

    meds_pool = [("Metformin","500 mg","BID"),("Lisinopril","10 mg","Daily"),("Apixaban","5 mg","BID"),
                 ("Atorvastatin","40 mg","Nightly"),("Albuterol","90 mcg","PRN"),("Furosemide","20 mg","Daily"),
                 ("Levothyroxine","75 mcg","Daily"),("Insulin glargine","18 U","Nightly"),("Amlodipine","5 mg","Daily")]
    meds = [ {"name":n,"dose":d,"freq":fq} for (n,d,fq) in random.sample(meds_pool, random.randint(1,4)) ]

    summary = f"{age}{sex}, {cond.lower()}. " + random.choice([
        "Trending stable; monitor labs at next visit.",
        "Watch for fluid overload; weigh daily.",
        "Glycemic control improving on current regimen.",
        "Recent vitals within acceptable range.",
        "Flagged for care-team review this week.",
    ])

    patients.append({
        "id":mrn,"name":name,"age":age,"sex":sex,"status":status,"risk":rk,"riskScore":score,
        "condition":cond,"careTeam":random.choice(clin),
        "room": random.choice(["412","218","ICU-3","T-7","—","305","DU-2"]) if status in ("admitted","observation") else None,
        "location":random.choice(wards),"lastSeen":iso(last_seen),
        "nextAppt": iso(nxt) if nxt else None,
        "insurer":random.choice(insurers),
        "flags":flags,"vitals":vitals_for(rk),"timeline":tl,
        "allergies":allergies,"medications":meds,
        "aiSummary":summary,
    })

# sort by risk score desc so high-risk float up by default
order = {"critical":3,"high":2,"moderate":1,"low":0}
patients.sort(key=lambda p:(order[p["risk"]], p["riskScore"]), reverse=True)

ts = "import type { Patient } from \"./types\";\n\n// Deterministic, synthetic demo data. No real patient information (PHI).\nexport const patients: Patient[] = "
ts += json.dumps(patients, indent=2, ensure_ascii=False).replace("null","undefined")
ts += " as Patient[];\n\nexport const patientById = (id: string) => patients.find((p) => p.id === id);\n"

with open("client/src/data/patients.ts","w") as f:
    f.write(ts)
print("patients:", len(patients))
