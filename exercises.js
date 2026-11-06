'use strict';
/* ฐานข้อมูลท่าออกกำลังกาย — ภาพประกอบจาก free-exercise-db (สาธารณสมบัติ) */
const IMG_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/';

const MUSCLES = {
  chest:     { th: 'อก',        e: '🏋️' },
  back:      { th: 'หลัง',      e: '🧗' },
  shoulders: { th: 'ไหล่',      e: '🤸' },
  arms:      { th: 'แขน',       e: '💪' },
  legs:      { th: 'ขา',        e: '🦵' },
  glutes:    { th: 'ก้น',       e: '🍑' },
  core:      { th: 'หน้าท้อง',  e: '🎯' },
  cardio:    { th: 'คาร์ดิโอ',  e: '🏃' }
};
const EQUIP = {
  body:      'น้ำหนักตัว',
  dumbbell:  'ดัมเบล',
  barbell:   'บาร์เบล',
  machine:   'เครื่อง/เคเบิล',
  kettlebell:'เคตเทิลเบล',
  other:     'อื่นๆ'
};

// [id(db), ไทย, English, muscle, equip, tip]
const _EX = [
  // อก
  ['Pushups','วิดพื้น','Push-Up','chest','body','มือกว้างกว่าไหล่เล็กน้อย ลำตัวตรงเป็นแนวเดียว ลงจนอกเกือบแตะพื้น'],
  ['Incline_Push-Up','วิดพื้นมือสูง (ง่ายขึ้น)','Incline Push-Up','chest','body','วางมือบนม้านั่งหรือโต๊ะ เหมาะกับผู้เริ่มต้น'],
  ['Decline_Push-Up','วิดพื้นเท้าสูง (ยากขึ้น)','Decline Push-Up','chest','body','วางเท้าบนม้านั่ง เน้นอกส่วนบนและไหล่'],
  ['Barbell_Bench_Press_-_Medium_Grip','บาร์เบลเบนช์เพรส','Barbell Bench Press','chest','barbell','เก็บสะบักชิดกัน ลงบาร์ที่กลางอก ดันขึ้นตรงๆ ควรมีสปอตเตอร์'],
  ['Dumbbell_Bench_Press','ดัมเบลเบนช์เพรส','Dumbbell Bench Press','chest','dumbbell','ลงให้ข้อศอกเลยลำตัวเล็กน้อย ควบคุมจังหวะลงช้าๆ'],
  ['Incline_Dumbbell_Press','ดัมเบลอินคไลน์เพรส','Incline Dumbbell Press','chest','dumbbell','ปรับม้านั่ง 30–45° เน้นอกส่วนบน'],
  ['Dumbbell_Flyes','ดัมเบลฟลาย','Dumbbell Flyes','chest','dumbbell','งอข้อศอกเล็กน้อย กางแขนเป็นวงโค้งจนรู้สึกยืดที่อก'],
  ['Cable_Crossover','เคเบิลครอสโอเวอร์','Cable Crossover','chest','machine','โน้มตัวเล็กน้อย ดึงสายมาบรรจบกันหน้าอกแล้วบีบค้าง 1 วินาที'],
  ['Butterfly','เพคเด็คฟลาย','Pec Deck Fly','chest','machine','หลังแนบเบาะ บีบอกให้สุดตอนมือมาชนกัน'],
  ['Leverage_Chest_Press','เครื่องดันอก','Machine Chest Press','chest','machine','ปรับเบาะให้มือเสมอกลางอก เหมาะกับผู้เริ่มต้น'],
  // หลัง
  ['Pullups','พูลอัพ','Pull-Up','back','body','เริ่มจากห้อยตัวเต็มแขน ดึงจนคางพ้นบาร์ ไม่เหวี่ยงตัว'],
  ['Chin-Up','ชินอัพ (จับหงาย)','Chin-Up','back','body','จับหงายช่วยให้ใช้ไบเซ็ปด้วย ง่ายกว่าพูลอัพเล็กน้อย'],
  ['Wide-Grip_Lat_Pulldown','แลตพูลดาวน์','Lat Pulldown','back','machine','ดึงบาร์ลงมาที่ไหปลาร้า เก็บสะบัก ไม่เอนหลังมาก'],
  ['Seated_Cable_Rows','ซีทเคเบิลโรว์','Seated Cable Row','back','machine','หลังตรง ดึงศอกไปด้านหลัง บีบสะบักชิดกัน'],
  ['Bent_Over_Two-Dumbbell_Row','ดัมเบลโรว์ก้มตัว','Bent-Over Dumbbell Row','back','dumbbell','ก้มตัวหลังตรงขนานพื้น ดึงดัมเบลเข้าหาสะโพก'],
  ['One-Arm_Dumbbell_Row','ดัมเบลโรว์แขนเดียว','One-Arm Dumbbell Row','back','dumbbell','เท้าข้างหนึ่งและมือข้างหนึ่งยันม้านั่ง ดึงศอกขึ้นชิดลำตัว'],
  ['Inverted_Row','อินเวิร์ตโรว์ (ดึงตัวใต้บาร์)','Inverted Row','back','body','ลำตัวตรง ดึงอกเข้าหาบาร์ ปรับความยากด้วยองศาลำตัว'],
  ['Barbell_Deadlift','เดดลิฟต์','Barbell Deadlift','back','barbell','หลังตรงเสมอ ดันพื้นด้วยขา บาร์ชิดตัว ต้องฝึกท่าทางก่อนเพิ่มน้ำหนัก'],
  ['Superman','ซูเปอร์แมน (แอ่นหลัง)','Superman','back','body','นอนคว่ำ ยกแขนขาพร้อมกันค้าง 2 วินาที เสริมกล้ามหลังล่าง'],
  // ไหล่
  ['Dumbbell_Shoulder_Press','ดัมเบลช้อลเดอร์เพรส','Dumbbell Shoulder Press','shoulders','dumbbell','เกร็งท้อง ไม่แอ่นหลัง ดันขึ้นเหนือศีรษะ'],
  ['Arnold_Dumbbell_Press','อาร์โนลด์เพรส','Arnold Press','shoulders','dumbbell','หมุนข้อมือขณะดัน ใช้ไหล่ได้ครบทุกส่วน'],
  ['Side_Lateral_Raise','ยกไหล่ด้านข้าง','Lateral Raise','shoulders','dumbbell','ยกถึงระดับไหล่ ใช้น้ำหนักเบา คุมจังหวะ'],
  ['Reverse_Flyes','ยกไหล่ด้านหลัง','Rear Delt Fly','shoulders','dumbbell','ก้มตัว กางแขนออกด้านข้าง บีบสะบักเล็กน้อย'],
  ['Face_Pull','เฟซพูล','Face Pull','shoulders','machine','ดึงเชือกเข้าหาใบหน้า ศอกสูง ดีต่อสุขภาพไหล่'],
  ['Machine_Shoulder_Military_Press','เครื่องดันไหล่','Machine Shoulder Press','shoulders','machine','ปรับเบาะให้มือเสมอระดับไหล่ ปลอดภัยสำหรับมือใหม่'],
  ['Barbell_Shrug','ยักไหล่บาร์เบล','Barbell Shrug','shoulders','barbell','ยกไหล่ขึ้นหาหู ค้างสั้นๆ ไม่หมุนไหล่'],
  // แขน
  ['Dumbbell_Alternate_Bicep_Curl','ดัมเบลเคิร์ลสลับแขน','Alternating Dumbbell Curl','arms','dumbbell','ศอกแนบลำตัว ไม่แกว่งตัว'],
  ['Barbell_Curl','บาร์เบลเคิร์ล','Barbell Curl','arms','barbell','ล็อกศอกแนบลำตัว ยกขึ้นสุดและลงช้าๆ'],
  ['Hammer_Curls','แฮมเมอร์เคิร์ล','Hammer Curl','arms','dumbbell','จับแนวตั้ง เน้นกล้ามแขนส่วนนอกและปลายแขน'],
  ['Concentration_Curls','คอนเซนเทรชันเคิร์ล','Concentration Curl','arms','dumbbell','นั่งศอกยันต้นขา โฟกัสบีบกล้ามเนื้อ'],
  ['Triceps_Pushdown','ไตรเซ็ปพุชดาวน์','Triceps Pushdown','arms','machine','ศอกแนบลำตัว ดันลงจนแขนตรง'],
  ['Cable_Rope_Overhead_Triceps_Extension','ไตรเซ็ปเหนือศีรษะ (เชือก)','Overhead Triceps Extension','arms','machine','ศอกชี้ขึ้น ยืดเหยียดไตรเซ็ปเต็มช่วง'],
  ['Bench_Dips','เบนช์ดิป','Bench Dips','arms','body','มือยันม้านั่งด้านหลัง ลงศอก 90° ระวังไหล่'],
  ['Close-Grip_Barbell_Bench_Press','เบนช์เพรสมือแคบ','Close-Grip Bench Press','arms','barbell','จับแคบกว่าไหล่เล็กน้อย ศอกชิดลำตัว เน้นไตรเซ็ป'],
  // ขา
  ['Bodyweight_Squat','สควอทน้ำหนักตัว','Bodyweight Squat','legs','body','เข่าชี้ตามปลายเท้า ส้นเท้าติดพื้น ลงให้ต้นขาขนานพื้น'],
  ['Goblet_Squat','โกเบลทสควอท','Goblet Squat','legs','kettlebell','ถือน้ำหนักชิดอก ลำตัวตั้งตรง เหมาะสำหรับเรียนรู้ท่าสควอท'],
  ['Barbell_Squat','บาร์เบลสควอท','Barbell Squat','legs','barbell','เกร็งท้อง หลังตรง ลงลึกจนต้นขาขนานพื้น ราชาแห่งท่าขา'],
  ['Dumbbell_Lunges','ดัมเบลลันจ์','Dumbbell Lunge','legs','dumbbell','ก้าวยาว ลำตัวตรง เข่าหน้าไม่เลยปลายเท้ามาก'],
  ['Bodyweight_Walking_Lunge','วอล์กกิ้งลันจ์','Walking Lunge','legs','body','ก้าวเดินไปข้างหน้าสลับขา ทรงตัวให้มั่นคง'],
  ['Split_Squat_with_Dumbbells','สปลิตสควอทดัมเบล','Dumbbell Split Squat','legs','dumbbell','เท้าหน้า-หลังคงที่ ลงตรงๆ เน้นต้นขาและก้น'],
  ['Dumbbell_Step_Ups','สเต็ปอัพดัมเบล','Dumbbell Step-Up','legs','dumbbell','ก้าวขึ้นม้านั่งด้วยขานำ ไม่เหวี่ยงตัว'],
  ['Leg_Press','เลกเพรส','Leg Press','legs','machine','ไม่ล็อกเข่าตอนสุด ก้นไม่ลอยจากเบาะ'],
  ['Hack_Squat','แฮคสควอท','Hack Squat','legs','machine','หลังแนบเบาะ เน้นต้นขาด้านหน้า'],
  ['Leg_Extensions','เลกเอ็กซ์เทนชัน','Leg Extension','legs','machine','เหยียดเข่าจนสุดแล้วบีบค้าง ลงช้าๆ'],
  ['Lying_Leg_Curls','เลกเคิร์ลนอนคว่ำ','Lying Leg Curl','legs','machine','งอเข่าดึงส้นเท้าเข้าหาก้น เน้นต้นขาด้านหลัง'],
  ['Seated_Leg_Curl','เลกเคิร์ลนั่ง','Seated Leg Curl','legs','machine','ปรับเบาะให้เข่าตรงแกนเครื่อง'],
  ['Romanian_Deadlift','โรมาเนียนเดดลิฟต์','Romanian Deadlift','legs','barbell','หลังตรง ดันสะโพกไปด้านหลัง รู้สึกยืดที่ต้นขาด้านหลัง'],
  ['Stiff-Legged_Dumbbell_Deadlift','สติฟเลกเดดลิฟต์ดัมเบล','Stiff-Leg Dumbbell Deadlift','legs','dumbbell','เข่างอเล็กน้อย ก้มโดยพับสะโพก'],
  ['Standing_Calf_Raises','ยืนเขย่งน่อง','Standing Calf Raise','legs','machine','เขย่งสุด ค้าง 1 วินาที ลงยืดเต็มช่วง'],
  // ก้น
  ['Barbell_Hip_Thrust','ฮิปทรัสต์','Hip Thrust','glutes','barbell','หลังส่วนบนพิงม้านั่ง ดันสะโพกจนลำตัวเป็นเส้นตรง บีบก้นค้าง'],
  ['Butt_Lift_Bridge','กลูทบริดจ์','Glute Bridge','glutes','body','นอนหงายชันเข่า ยกสะโพกขึ้น บีบก้นค้าง 2 วินาที'],
  ['Single_Leg_Glute_Bridge','กลูทบริดจ์ขาเดียว','Single-Leg Glute Bridge','glutes','body','ยกขาข้างหนึ่งขึ้น ดันสะโพกด้วยขาที่เหลือ'],
  ['Glute_Kickback','เตะก้นไปด้านหลัง','Glute Kickback','glutes','body','คลานสี่ขา เตะขาขึ้นเหนือสะโพก ไม่แอ่นหลัง'],
  // หน้าท้อง
  ['Plank','แพลงก์','Plank','core','body','ลำตัวเป็นเส้นตรง เกร็งท้องและก้น ไม่ให้สะโพกตก'],
  ['Crunches','ครันช์','Crunch','core','body','ยกไหล่พ้นพื้น ไม่ดึงคอ หายใจออกตอนขึ้น'],
  ['Air_Bike','ไบซิเคิลครันช์','Bicycle Crunch','core','body','บิดข้อศอกไปหาเข่าตรงข้าม จังหวะช้าและควบคุมได้'],
  ['Russian_Twist','รัสเซียนทวิสต์','Russian Twist','core','body','เอนตัวเล็กน้อย บิดลำตัวสองข้าง ยกเท้าให้ยากขึ้น'],
  ['Flat_Bench_Lying_Leg_Raise','นอนยกขา','Lying Leg Raise','core','body','หลังล่างแนบพื้น ยกขาตรงช้าๆ'],
  ['Hanging_Leg_Raise','ห้อยตัวยกขา','Hanging Leg Raise','core','body','ห้อยบาร์ ยกขาขึ้นด้วยแรงท้อง ไม่เหวี่ยง'],
  ['Dead_Bug','เดดบัก','Dead Bug','core','body','หลังล่างแนบพื้น ยื่นแขนขาตรงข้ามสลับกันช้าๆ'],
  ['Cable_Crunch','เคเบิลครันช์','Cable Crunch','core','machine','คุกเข่า ม้วนลำตัวลงด้วยแรงท้อง ไม่ใช้แขนดึง'],
  ['Ab_Roller','ลูกล้อบริหารหน้าท้อง','Ab Roller','core','other','เกร็งท้องตลอด ไม่แอ่นหลัง เริ่มจากช่วงสั้นๆ'],
  // คาร์ดิโอ
  ['Mountain_Climbers','เมาน์เทนไคลเมอร์','Mountain Climbers','cardio','body','ท่าวิดพื้น สลับเข่าเข้าหาอกเร็วๆ เผาผลาญสูง'],
  ['Rope_Jumping','กระโดดเชือก','Jump Rope','cardio','other','กระโดดเบาๆ ข้อมือหมุนเชือก ลงปลายเท้า'],
  ['One-Arm_Kettlebell_Swings','เคตเทิลเบลสวิง','Kettlebell Swing','cardio','kettlebell','ใช้แรงสะโพกดีดขึ้น ไม่ใช้แขนยก หลังตรง'],
  ['Freehand_Jump_Squat','จัมป์สควอท','Jump Squat','cardio','body','สควอทแล้วกระโดดขึ้น ลงนุ่มๆ งอเข่ารับแรง'],
  ['Walking_Treadmill','เดินสายพาน (ชัน)','Incline Treadmill Walk','cardio','machine','ปรับความชัน 8–12% เดินเร็ว ไม่เกาะราว'],
  ['Running_Treadmill','วิ่งสายพาน','Treadmill Run','cardio','machine','ทำเป็นอินเทอร์วัล วิ่งเร็ว 1 นาที สลับเดิน 1–2 นาที'],
  ['Rowing_Stationary','เครื่องพาย','Rowing Machine','cardio','machine','ดันขาก่อน ตามด้วยลำตัวและแขน คาร์ดิโอทั้งตัว'],
  ['Stairmaster','เครื่องเดินขึ้นบันได','Stair Climber','cardio','machine','ยืนตัวตรง ก้าวเต็มเท้า ไม่เกาะราวหนัก'],
  ['Elliptical_Trainer','เครื่องเอลลิปติคอล','Elliptical','cardio','machine','คาร์ดิโอแรงกระแทกต่ำ เหมาะกับคนมีปัญหาข้อเข่า'],
  ['Recumbent_Bike','จักรยานนั่งเอน','Recumbent Bike','cardio','machine','ปั่นสบาย เหมาะวอร์มอัพ/คูลดาวน์'],
  // ไม่มีภาพ (ใช้ปุ่มวิดีโอ)
  ['@burpee','เบอร์พี','Burpee','cardio','body','ย่อ-วิดพื้น-ลุกกระโดด ปรับให้ง่ายขึ้นด้วยการไม่วิดพื้น'],
  ['@jumping-jack','จัมปิ้งแจ็ค','Jumping Jacks','cardio','body','กระโดดกางแขนขาพร้อมกัน เหมาะวอร์มอัพ'],
  ['@high-knees','วิ่งยกเข่าสูง','High Knees','cardio','body','วิ่งอยู่กับที่ ยกเข่าสูงระดับสะโพก']
];

const EX = _EX.map(([id, th, en, m, eq, tip]) => ({ id, th, en, m, eq, tip, db: !id.startsWith('@') }));

/* เทมเพลตโปรแกรม: [exId, sets, reps, restSec] */
const TEMPLATES = {
  fat: {
    label: 'ลดไขมัน • 3 วัน/สัปดาห์ (เซอร์กิตทั้งตัว)',
    days: [
      { name: 'วันที่ 1 • ทั้งตัว A', items: [
        ['Goblet_Squat',3,'15',45],['Incline_Push-Up',3,'12',45],['Seated_Cable_Rows',3,'15',45],
        ['Dumbbell_Lunges',3,'12 ข้าง',45],['Plank',3,'40 วินาที',30],['Walking_Treadmill',1,'15 นาที',0]] },
      { name: 'วันที่ 2 • ทั้งตัว B', items: [
        ['Romanian_Deadlift',3,'12',45],['Dumbbell_Shoulder_Press',3,'12',45],['Wide-Grip_Lat_Pulldown',3,'12',45],
        ['Butt_Lift_Bridge',3,'15',30],['Russian_Twist',3,'20',30],['One-Arm_Kettlebell_Swings',4,'15',45],['Mountain_Climbers',3,'30 วินาที',30]] },
      { name: 'วันที่ 3 • ทั้งตัว C + HIIT', items: [
        ['Leg_Press',3,'15',45],['Dumbbell_Bench_Press',3,'12',45],['Bent_Over_Two-Dumbbell_Row',3,'12',45],
        ['Dumbbell_Step_Ups',3,'12 ข้าง',45],['Crunches',3,'20',30],['@burpee',3,'10',45],['Running_Treadmill',6,'1 นาที เร็ว / 1 นาที เดิน',0]] }
    ]
  },
  muscle: {
    label: 'สร้างกล้ามเนื้อ • 4 วัน/สัปดาห์ (บน-ล่าง)',
    days: [
      { name: 'วันที่ 1 • ร่างกายส่วนบน A', items: [
        ['Barbell_Bench_Press_-_Medium_Grip',4,'6–8',120],['Wide-Grip_Lat_Pulldown',4,'8–10',90],['Dumbbell_Shoulder_Press',3,'8–10',90],
        ['Seated_Cable_Rows',3,'10',90],['Barbell_Curl',3,'10–12',60],['Triceps_Pushdown',3,'10–12',60]] },
      { name: 'วันที่ 2 • ร่างกายส่วนล่าง A', items: [
        ['Barbell_Squat',4,'6–8',150],['Romanian_Deadlift',3,'8–10',120],['Leg_Press',3,'10–12',90],
        ['Lying_Leg_Curls',3,'10–12',60],['Standing_Calf_Raises',4,'12–15',45],['Cable_Crunch',3,'12–15',45]] },
      { name: 'วันที่ 3 • ร่างกายส่วนบน B', items: [
        ['Incline_Dumbbell_Press',4,'8–10',90],['Pullups',4,'6–10',90],['Arnold_Dumbbell_Press',3,'10',90],
        ['One-Arm_Dumbbell_Row',3,'10 ข้าง',60],['Side_Lateral_Raise',3,'12–15',45],['Hammer_Curls',3,'12',60],['Cable_Rope_Overhead_Triceps_Extension',3,'12',60]] },
      { name: 'วันที่ 4 • ร่างกายส่วนล่าง B', items: [
        ['Barbell_Hip_Thrust',4,'8–10',90],['Hack_Squat',4,'8–10',120],['Split_Squat_with_Dumbbells',3,'10 ข้าง',90],
        ['Leg_Extensions',3,'12',60],['Seated_Leg_Curl',3,'12',60],['Hanging_Leg_Raise',3,'12',45]] }
    ]
  }
};

const GOALS = {
  fat:    { th: 'ลดไขมัน',          e: '🔥', color: '#FF6A3D', tips: [
    'เน้นเซ็ตต่อเนื่อง พักสั้น 30–60 วินาที เพื่อให้หัวใจเต้นสูง',
    'เพิ่มคาร์ดิโอ/เดินหลังเวท 10–20 นาที และเป้าเดินวันละ 8,000–10,000 ก้าว',
    'ควบคุมพลังงานให้ขาดดุลเล็กน้อย โปรตีน ~1.6–2 กรัม/น้ำหนักตัว 1 กก.',
    'นอนให้พอ 7–9 ชั่วโมง และดื่มน้ำสม่ำเสมอ'] },
  muscle: { th: 'สร้างกล้ามเนื้อ', e: '💪', color: '#5B6CFF', tips: [
    'ใช้หลัก Progressive Overload เพิ่มน้ำหนักหรือจำนวนครั้งทีละน้อยทุกสัปดาห์',
    'ท่าหลักพักนาน 1.5–3 นาที ท่าเสริมพัก 45–90 วินาที',
    'กินพลังงานให้เกินเล็กน้อย โปรตีน ~1.6–2.2 กรัม/น้ำหนักตัว 1 กก.',
    'พักกล้ามกลุ่มเดิมอย่างน้อย 48 ชั่วโมง และนอนให้พอ'] }
};
