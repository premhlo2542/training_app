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
  light:     'ยางยืด/ลูกบอล/โฟมโรลเลอร์',
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
  ['Dumbbell_Squat','ดัมเบลสควอท','Dumbbell Squat','legs','dumbbell','ถือดัมเบลสองข้างข้างลำตัว หลังตรง ลงให้ต้นขาขนานพื้น'],
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
  ['Calf_Raise_On_A_Dumbbell','เขย่งน่องถือดัมเบล','Dumbbell Calf Raise','legs','dumbbell','เขย่งปลายเท้าบนขอบบันได ถือดัมเบลข้างเดียว ค้างสุด 1 วินาที'],
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
  ['Ab_Roller','ลูกล้อบริหารหน้าท้อง','Ab Roller','core','light','เกร็งท้องตลอด ไม่แอ่นหลัง เริ่มจากช่วงสั้นๆ'],
  // คาร์ดิโอ
  ['Mountain_Climbers','เมาน์เทนไคลเมอร์','Mountain Climbers','cardio','body','ท่าวิดพื้น สลับเข่าเข้าหาอกเร็วๆ เผาผลาญสูง'],
  ['Rope_Jumping','กระโดดเชือก','Jump Rope','cardio','light','กระโดดเบาๆ ข้อมือหมุนเชือก ลงปลายเท้า'],
  ['One-Arm_Kettlebell_Swings','เคตเทิลเบลสวิง','Kettlebell Swing','cardio','kettlebell','ใช้แรงสะโพกดีดขึ้น ไม่ใช้แขนยก หลังตรง'],
  ['Freehand_Jump_Squat','จัมป์สควอท','Jump Squat','cardio','body','สควอทแล้วกระโดดขึ้น ลงนุ่มๆ งอเข่ารับแรง'],
  ['Walking_Treadmill','เดินสายพาน (ชัน)','Incline Treadmill Walk','cardio','machine','ปรับความชัน 8–12% เดินเร็ว ไม่เกาะราว'],
  ['Running_Treadmill','วิ่งสายพาน','Treadmill Run','cardio','machine','ทำเป็นอินเทอร์วัล วิ่งเร็ว 1 นาที สลับเดิน 1–2 นาที'],
  ['Rowing_Stationary','เครื่องพาย','Rowing Machine','cardio','machine','ดันขาก่อน ตามด้วยลำตัวและแขน คาร์ดิโอทั้งตัว'],
  ['Stairmaster','เครื่องเดินขึ้นบันได','Stair Climber','cardio','machine','ยืนตัวตรง ก้าวเต็มเท้า ไม่เกาะราวหนัก'],
  ['Elliptical_Trainer','เครื่องเอลลิปติคอล','Elliptical','cardio','machine','คาร์ดิโอแรงกระแทกต่ำ เหมาะกับคนมีปัญหาข้อเข่า'],
  ['Recumbent_Bike','จักรยานนั่งเอน','Recumbent Bike','cardio','machine','ปั่นสบาย เหมาะวอร์มอัพ/คูลดาวน์'],
  // ไม่มีภาพ (ใช้ปุ่มวิดีโอ)
];

const PLACES = { gym: { th: 'ที่ยิม', e: '🏋️' }, home: { th: 'ที่บ้าน', e: '🏠' } };
// ท่าที่ทำที่บ้านได้: น้ำหนักตัว ดัมเบล เคตเทิลเบล และอุปกรณ์เบาๆ (ยางยืด/ลูกบอล/โฟมโรลเลอร์/เชือก)
const homeOk = e => ['body', 'dumbbell', 'kettlebell', 'light'].includes(e.eq) || e.custom;

/* ---------- ข้อมูลกล้ามเนื้อ (ไทย) ---------- */
const MUSCLE_INFO = {
  'abdominals': { th: 'กล้ามเนื้อหน้าท้อง', sub: 'Rectus abdominis • Transversus abdominis • Obliques', d: 'แผงกล้ามท้อง "ซิกซ์แพ็ก" ด้านหน้า กล้ามท้องชั้นลึกที่รัดลำไส้และพยุงหลัง และกล้ามท้องด้านข้างที่ช่วยบิดและเอียงลำตัว ช่วยให้แกนกลางลำตัวมั่นคง' },
  'abductors': { th: 'สะโพกด้านนอก', sub: 'Gluteus medius • Gluteus minimus • TFL', d: 'กล้ามเนื้อด้านข้างสะโพกที่ช่วยกางขาออก ทรงตัวขณะยืนขาเดียว และทำให้สะโพกด้านข้างกระชับ' },
  'adductors': { th: 'ต้นขาด้านใน', sub: 'Adductor magnus • longus • brevis • Gracilis', d: 'กล้ามเนื้อต้นขาด้านในที่ช่วยหุบขาเข้าหากัน ช่วยพยุงเข่าและสะโพก ท่ายืดจะรู้สึกตึงบริเวณขาหนีบ' },
  'biceps': { th: 'ต้นแขนด้านหน้า (ไบเซ็ป)', sub: 'Biceps brachii (หัวสั้น/หัวยาว) • Brachialis', d: 'กล้ามเนื้อที่งอข้อศอกและหมุนแขนหงาย หัวยาวทำให้ต้นแขนดูนูนสูง ส่วน Brachialis อยู่ใต้ไบเซ็ปช่วยเพิ่มความหนาของแขน' },
  'calves': { th: 'น่อง', sub: 'Gastrocnemius (น่องนอก/ใน) • Soleus', d: 'กล้ามเนื้อน่องที่ใช้เขย่งปลายเท้า เดิน วิ่ง และกระโดด Gastrocnemius อยู่ผิวนอก ส่วน Soleus อยู่ชั้นลึกใช้มากเมื่อเข่างอ' },
  'chest': { th: 'อก', sub: 'Pectoralis major (อกบน/กลาง/ล่าง) • Pectoralis minor', d: 'กล้ามอกใหญ่ที่ดัน กางแขน และหุบแขนเข้าหากลางลำตัว ท่าเอียงขึ้นเน้นอกส่วนบน ท่าราบเน้นอกส่วนกลาง และท่าเอียงลงเน้นอกส่วนล่าง' },
  'forearms': { th: 'ปลายแขน', sub: 'Wrist flexors • Wrist extensors • Brachioradialis', d: 'กล้ามเนื้อที่งอ-เหยียดข้อมือและช่วยการจับ ส่งผลต่อแรงบีบมือและความมั่นคงของข้อมือ' },
  'glutes': { th: 'ก้น', sub: 'Gluteus maximus • medius • minimus', d: 'กล้ามเนื้อมัดใหญ่ที่สุดของร่างกาย ใช้เหยียดสะโพก ลุกยืน ก้าวขึ้นบันได และกระโดด ทำให้ก้นกระชับและช่วยปกป้องหลังล่าง' },
  'hamstrings': { th: 'ต้นขาด้านหลัง', sub: 'Biceps femoris • Semitendinosus • Semimembranosus', d: 'กล้ามเนื้อสามมัดหลังต้นขาที่งอเข่าและเหยียดสะโพก ช่วยพยุงเข่า ป้องกันการบาดเจ็บ และมักตึงเมื่อนั่งนาน' },
  'hip flexors': { th: 'กล้ามงอสะโพก', sub: 'Iliopsoas • Rectus femoris', d: 'กล้ามเนื้อลึกด้านหน้าสะโพกที่ยกเข่าขึ้นหาลำตัว มักตึงและสั้นเมื่อนั่งนาน ส่งผลให้หลังล่างแอ่น' },
  'lats': { th: 'ปีกหลัง', sub: 'Latissimus dorsi (กล้ามหลังกว้าง)', d: 'กล้ามเนื้อแผ่นใหญ่ด้านข้างของหลังที่ดึงแขนลงและเข้าหาลำตัว ทำให้หลังกว้างเป็นรูปตัววี ใช้มากในท่าดึง เช่น พูลอัพ แลตพูลดาวน์' },
  'lower back': { th: 'หลังส่วนล่าง', sub: 'Erector spinae • Quadratus lumborum', d: 'กล้ามเนื้อสองข้างของกระดูกสันหลังช่วงเอวที่พยุงลำตัวให้ตรงและเหยียดหลัง สำคัญมากต่อท่าเดดลิฟต์และการยกของ ควรทำด้วยท่าที่ถูกต้อง' },
  'middle back': { th: 'กลางหลัง', sub: 'Rhomboids • Trapezius ส่วนกลาง/ล่าง • Teres major', d: 'กล้ามเนื้อที่ดึงสะบักเข้าหากัน ช่วยให้ไหล่ไม่ห่อและท่าทางดี ใช้ในท่าโรว์ทุกแบบ' },
  'neck': { th: 'คอ', sub: 'Sternocleidomastoid • Splenius • Levator scapulae', d: 'กล้ามเนื้อรอบคอที่หมุน ก้ม เงยและพยุงศีรษะ มักตึงจากการก้มจอหรือนั่งทำงานนาน ควรทำเบาๆ ช้าๆ' },
  'quadriceps': { th: 'ต้นขาด้านหน้า (ควอดริเซ็ป)', sub: 'Rectus femoris • Vastus lateralis • medialis • intermedius', d: 'กล้ามเนื้อสี่มัดหน้าต้นขาที่เหยียดเข่า ใช้ในการสควอท ลันจ์ วิ่ง และขึ้นบันได Rectus femoris ยังช่วยงอสะโพก จึงตึงง่ายเมื่อนั่งนาน' },
  'shoulders': { th: 'ไหล่', sub: 'Deltoid (หน้า/ข้าง/หลัง) • Rotator cuff', d: 'กล้ามไหล่สามหัวที่ยกแขนไปด้านหน้า ด้านข้าง และด้านหลัง บวกกลุ่ม Rotator cuff ที่คอยพยุงข้อต่อไหล่ให้มั่นคง' },
  'traps': { th: 'บ่า', sub: 'Trapezius (บน/กลาง/ล่าง)', d: 'กล้ามเนื้อรูปสี่เหลี่ยมคางหมูจากคอถึงกลางหลัง ใช้ยักไหล่ ยกสะบัก และดึงสะบักเข้าหากัน มักปวดเมื่อยจากความเครียดและการนั่งทำงาน' },
  'triceps': { th: 'ต้นแขนด้านหลัง (ไตรเซ็ป)', sub: 'Triceps brachii (long • lateral • medial head)', d: 'กล้ามสามหัวหลังต้นแขนที่เหยียดข้อศอก คิดเป็นราว 2 ใน 3 ของขนาดต้นแขน ใช้ในท่าดันทุกชนิด เช่น วิดพื้น เบนช์เพรส' }
};
const GROUP_OF = { abdominals: 'core', abductors: 'glutes', adductors: 'legs', biceps: 'arms', calves: 'legs', chest: 'chest', forearms: 'arms', glutes: 'glutes', hamstrings: 'legs',
  lats: 'back', 'lower back': 'back', 'middle back': 'back', neck: 'shoulders', quadriceps: 'legs', shoulders: 'shoulders', traps: 'shoulders', triceps: 'arms' };
const CAT_TH = { strength: 'เวทเทรนนิ่ง', stretching: 'ยืดเหยียด', cardio: 'คาร์ดิโอ', plyo: 'พลัยโอเมตริก', special: 'ขั้นสูง/พิเศษ' };
const CAT_E = { strength: '🏋️', stretching: '🧘', cardio: '🏃', plyo: '⚡', special: '🔥' };
const LEVEL_TH = { b: 'เริ่มต้น', i: 'ปานกลาง', e: 'ขั้นสูง' };
const AUD = { w: { th: 'เหมาะกับผู้หญิง', e: '👩' }, k: { th: 'เหมาะกับเด็ก', e: '🧒' } };

/* รายละเอียดเชิงลึกเฉพาะท่ายอดนิยม (ส่วนย่อยของกล้ามเนื้อ) */
const FOCUS = {
  'Barbell_Bench_Press_-_Medium_Grip': 'เน้นอกส่วนกลางและล่าง รองลงมาคือไหล่ด้านหน้าและไตรเซ็ป',
  'Dumbbell_Bench_Press': 'เน้นอกส่วนกลาง ดัมเบลช่วยให้ลงลึกและหุบเข้ากลางอกได้มากกว่าบาร์',
  'Incline_Dumbbell_Press': 'เน้นอกส่วนบน (ใต้ไหปลาร้า) และไหล่ด้านหน้ามากขึ้น',
  'Dumbbell_Flyes': 'เน้นการยืดและบีบกล้ามอกด้านใน ไตรเซ็ปแทบไม่ช่วย',
  'Pushups': 'อกส่วนกลาง ไตรเซ็ป ไหล่หน้า และต้องเกร็งท้อง/ก้นเพื่อรักษาลำตัวให้ตรง',
  'Decline_Push-Up': 'เน้นอกส่วนบนและไหล่ด้านหน้ามากกว่าวิดพื้นปกติ',
  'Pullups': 'ปีกหลังเป็นหลัก ตามด้วยไบเซ็ป กลางหลัง และปลายแขน (กำลังจับ)',
  'Chin-Up': 'ปีกหลังและไบเซ็ปมากกว่าพูลอัพ เพราะจับหงาย',
  'Wide-Grip_Lat_Pulldown': 'ปีกหลังส่วนนอก (ทำให้หลังกว้าง) จับกว้างเน้นความกว้าง จับแคบเน้นความหนา',
  'Seated_Cable_Rows': 'กลางหลัง (Rhomboids) และปีกหลังส่วนล่าง ช่วยแก้ไหล่ห่อ',
  'Barbell_Deadlift': 'หลังล่าง ก้น ต้นขาด้านหลัง และบ่า ใช้กล้ามเนื้อด้านหลังลำตัวเกือบทั้งหมด',
  'Romanian_Deadlift': 'ต้นขาด้านหลังและก้นเป็นหลัก รู้สึกยืดที่หลังต้นขาตอนลง',
  'Barbell_Squat': 'ต้นขาด้านหน้าและก้น หลังล่างและหน้าท้องช่วยพยุงลำตัว ลงลึกเน้นก้นมากขึ้น',
  'Goblet_Squat': 'ต้นขาด้านหน้าและก้น ถือน้ำหนักหน้าอกช่วยให้ลำตัวตั้งตรง',
  'Dumbbell_Lunges': 'ต้นขาด้านหน้าและก้น ก้าวยาวขึ้นจะเน้นก้นมากขึ้น',
  'Barbell_Hip_Thrust': 'ก้น (Gluteus maximus) เป็นหลักเกือบทั้งหมด ต้นขาด้านหลังช่วยรอง',
  'Butt_Lift_Bridge': 'ก้นและต้นขาด้านหลัง บีบก้นค้างช่วงบนสุดเพื่อเน้นกล้ามก้น',
  'Glute_Kickback': 'ก้นด้านหลัง (Gluteus maximus) ยกสูงเกินไปจะไปใช้หลังล่างแทน',
  'Leg_Extensions': 'ต้นขาด้านหน้าแบบแยกส่วน (Isolation) เน้นช่วงเหยียดเข่าสุด',
  'Lying_Leg_Curls': 'ต้นขาด้านหลังแบบแยกส่วน ช่วยบาลานซ์กับต้นขาด้านหน้า',
  'Standing_Calf_Raises': 'น่องส่วนนอก (Gastrocnemius) เป็นหลัก',
  'Dumbbell_Shoulder_Press': 'ไหล่ส่วนหน้าและข้าง ไตรเซ็ปและบ่าช่วยดันขึ้น',
  'Side_Lateral_Raise': 'ไหล่ส่วนข้าง (Lateral deltoid) ทำให้ไหล่กว้าง',
  'Reverse_Flyes': 'ไหล่ส่วนหลังและกลางหลัง ช่วยแก้ท่าทางไหล่ห่อ',
  'Face_Pull': 'ไหล่หลังและกล้ามหมุนไหล่ (Rotator cuff) ดีต่อสุขภาพไหล่',
  'Barbell_Curl': 'ไบเซ็ปทั้งสองหัว ปลายแขนช่วยจับ',
  'Hammer_Curls': 'Brachialis และปลายแขน ทำให้แขนดูหนาขึ้นจากด้านข้าง',
  'Triceps_Pushdown': 'ไตรเซ็ป โดยเฉพาะหัวด้านข้าง (Lateral head) เห็นชัดเมื่อมองจากด้านหลัง',
  'Cable_Rope_Overhead_Triceps_Extension': 'ไตรเซ็ปหัวยาว (Long head) เพราะแขนอยู่เหนือศีรษะทำให้ยืดมาก',
  'Plank': 'Transversus abdominis (ท้องชั้นลึก) ร่วมกับไหล่ ก้น และหลังล่าง เป็นการเกร็งค้าง',
  'Crunches': 'หน้าท้องส่วนบน (Upper rectus abdominis)',
  'Hanging_Leg_Raise': 'หน้าท้องส่วนล่างและกล้ามงอสะโพก',
  'Russian_Twist': 'หน้าท้องด้านข้าง (Obliques) จากการบิดลำตัว',
  'Dead_Bug': 'ท้องชั้นลึกและกล้ามงอสะโพก ฝึกคุมหลังล่างให้แนบพื้น',
  'Mountain_Climbers': 'หน้าท้อง ไหล่ และต้นขาด้านหน้า พร้อมเผาผลาญสูงเพราะเป็นคาร์ดิโอ',
  'Superman': 'หลังล่างและก้น ช่วยเสริมความแข็งแรงของกล้ามเนื้อพยุงกระดูกสันหลัง'
};

/* ท่าเพิ่มเติม (ไม่มีภาพในฐานข้อมูล ใช้ไอคอนแทน + ปุ่มดูวิดีโอ):
   [id, ไทย, English, หมวด, อุปกรณ์, ระดับ, กล้ามหลัก[], กล้ามรอง[], กลุ่ม, เทคนิค] */
const _EXTRA = [
  ['@burpee', 'เบอร์พี', 'Burpee', 'cardio', 'body', 'i', ['quadriceps', 'chest'], ['glutes', 'shoulders', 'triceps', 'abdominals'], '', 'ย่อ-วิดพื้น-ลุกกระโดด ปรับให้ง่ายขึ้นด้วยการไม่วิดพื้น'],
  ['@jumping-jack', 'จัมปิ้งแจ็ค', 'Jumping Jacks', 'cardio', 'body', 'b', ['calves', 'quadriceps'], ['shoulders', 'glutes', 'abductors'], 'wk', 'กระโดดกางแขนขาพร้อมกัน เหมาะวอร์มอัพ'],
  ['@high-knees', 'วิ่งยกเข่าสูง', 'High Knees', 'cardio', 'body', 'b', ['quadriceps', 'abdominals'], ['calves', 'glutes', 'hamstrings'], 'wk', 'วิ่งอยู่กับที่ ยกเข่าสูงระดับสะโพก'],
  ['@butt-kicks', 'วิ่งส้นเท้าแตะก้น', 'Butt Kicks', 'cardio', 'body', 'b', ['hamstrings'], ['calves', 'quadriceps'], 'wk', 'วิ่งเหยาะอยู่กับที่ ดีดส้นเท้าขึ้นแตะก้น ยืดต้นขาหน้าไปด้วย'],
  ['@skater-hops', 'สเก็ตเตอร์ (กระโดดข้างสลับ)', 'Skater Hops', 'cardio', 'body', 'i', ['glutes', 'abductors'], ['quadriceps', 'calves', 'adductors'], 'w', 'กระโดดข้างสลับซ้ายขวาเหมือนนักสเก็ต ลงนุ่มๆ งอเข่ารับแรง'],
  ['@shadow-boxing', 'ชาโดว์บ็อกซิ่ง (ต่อยลม)', 'Shadow Boxing', 'cardio', 'body', 'b', ['shoulders', 'abdominals'], ['chest', 'triceps', 'calves'], 'wk', 'ต่อยหมัดตรง-หมัดฮุกสลับ หมุนสะโพกตามหมัด เผาผลาญสูงและสนุก'],
  ['@dance-cardio', 'แอโรบิกเต้นตามเพลง (ซุมบ้า)', 'Dance Cardio / Zumba', 'cardio', 'body', 'b', ['quadriceps', 'calves'], ['glutes', 'abdominals', 'shoulders'], 'wk', 'เต้นตามเพลงจังหวะสนุก 20–40 นาที เหมาะกับคนไม่ชอบคาร์ดิโอแบบเดิมๆ'],
  ['@brisk-walk', 'เดินเร็ว', 'Brisk Walking', 'cardio', 'body', 'b', ['quadriceps'], ['hamstrings', 'calves', 'glutes'], 'wk', 'เดินเร็วจนพูดเป็นประโยคได้แต่ร้องเพลงไม่ไหว เหมาะกับทุกวัย ข้อเข่าเจ็บน้อย'],
  ['@stair-climb', 'เดินขึ้นบันได', 'Stair Climbing', 'cardio', 'body', 'i', ['glutes', 'quadriceps'], ['calves', 'hamstrings'], 'w', 'ก้าวเต็มเท้า ลำตัวตั้งตรง ขึ้นบันไดเป็นคาร์ดิโอที่ช่วยกระชับก้น'],
  ['@star-jump', 'กระโดดสตาร์', 'Star Jumps', 'cardio', 'body', 'b', ['quadriceps', 'calves'], ['shoulders', 'glutes'], 'k', 'ย่อตัวแล้วกระโดดกางแขนขาเป็นรูปดาว ลงนุ่มๆ'],
  ['@bear-crawl', 'เดินหมี', 'Bear Crawl', 'cardio', 'body', 'b', ['shoulders', 'abdominals'], ['chest', 'triceps', 'quadriceps'], 'k', 'คลานด้วยมือและเท้า เข่าลอยเหนือพื้น หลังตรง เล่นเป็นเกมสัตว์ได้'],
  ['@crab-walk', 'เดินปู', 'Crab Walk', 'cardio', 'body', 'b', ['triceps', 'glutes'], ['shoulders', 'abdominals', 'hamstrings'], 'k', 'นั่งมือยันพื้นด้านหลัง ยกสะโพกแล้วเดินไปข้างหลัง/ข้างหน้า'],
  ['@frog-jump', 'กบกระโดด', 'Frog Jumps', 'cardio', 'body', 'b', ['quadriceps', 'glutes'], ['calves', 'abdominals'], 'k', 'ย่อลงต่ำมือแตะพื้นแล้วกระโดดไปข้างหน้าเหมือนกบ'],
  ['@hopscotch', 'กระโดดตาราง', 'Hopscotch', 'cardio', 'body', 'b', ['calves', 'quadriceps'], ['glutes', 'abdominals'], 'k', 'กระโดดขาเดียว/สองขาตามช่องตารางที่วาดไว้ ฝึกการทรงตัวและการประสานงาน'],
  ['@tree-pose', 'ท่าต้นไม้ (ยืนขาเดียว)', 'Tree Pose', 'stretching', 'body', 'b', ['abductors', 'quadriceps'], ['calves', 'abdominals', 'adductors'], 'wk', 'ยืนขาเดียว ประกบเท้าอีกข้างที่น่อง/ต้นขาด้านใน มองจุดเดียว ฝึกสมาธิและการทรงตัว'],
  ['@hula-hoop', 'หมุนฮูลาฮูป', 'Hula Hoop', 'cardio', 'light', 'b', ['abdominals'], ['lower back', 'glutes', 'abductors'], 'wk', 'หมุนห่วงรอบเอว 5–10 นาที เสริมกล้ามท้องด้านข้างและเผาผลาญ'],
  ['@fire-hydrant', 'ไฟร์ไฮแดรนท์ (ยกขาข้างคลานสี่ขา)', 'Fire Hydrant', 'strength', 'body', 'b', ['abductors', 'glutes'], ['abdominals', 'quadriceps'], 'w', 'คลานสี่ขา ยกเข่าออกด้านข้างเหมือนสุนัขฉี่ ไม่ให้สะโพกบิด ช่วยกระชับสะโพกด้านข้าง'],
  ['@clamshell', 'คลามเชลล์ (นอนตะแคงเปิดเข่า)', 'Clamshell', 'strength', 'body', 'b', ['abductors', 'glutes'], ['adductors'], 'w', 'นอนตะแคง งอเข่า ส้นเท้าชิดกัน เปิดเข่าบนขึ้นเหมือนหอยกาบ เหมาะกับคนปวดเข่า/สะโพก'],
  ['@donkey-kick', 'ดังกี้คิก (เตะขาไปด้านหลัง)', 'Donkey Kick', 'strength', 'body', 'b', ['glutes'], ['hamstrings', 'lower back'], 'w', 'คลานสี่ขา เตะส้นเท้าขึ้นฟ้าโดยงอเข่า 90° บีบก้นที่ด้านบน ไม่แอ่นหลัง'],
  ['@curtsy-lunge', 'เคิร์ทซีลันจ์ (ลันจ์ไขว้ขา)', 'Curtsy Lunge', 'strength', 'body', 'i', ['glutes', 'quadriceps'], ['adductors', 'abductors', 'hamstrings'], 'w', 'ก้าวขาข้างหนึ่งไขว้ไปด้านหลังเหมือนถอนสายบัว ใช้ก้นและสะโพกด้านข้างหนักกว่าลันจ์ปกติ'],
  ['@sumo-squat', 'ซูโม่สควอท (ยืนกว้าง)', 'Sumo Squat', 'strength', 'body', 'b', ['glutes', 'adductors'], ['quadriceps', 'hamstrings'], 'w', 'ยืนกว้างกว่าไหล่ ปลายเท้าชี้ออก ย่อลงตรงๆ เน้นก้นและต้นขาด้านใน'],
  ['@side-lying-leg-raise', 'นอนตะแคงยกขา', 'Side-Lying Leg Raise', 'strength', 'body', 'b', ['abductors', 'glutes'], ['quadriceps'], 'w', 'นอนตะแคง ยกขาบนขึ้นช้าๆ ปลายเท้าชี้ตรง ไม่เอนตัวไปด้านหลัง'],
  ['@bird-dog', 'เบิร์ดด็อก', 'Bird Dog', 'strength', 'body', 'b', ['lower back', 'glutes'], ['abdominals', 'shoulders', 'hamstrings'], 'wk', 'คลานสี่ขา เหยียดแขนขวาตรงข้ามกับขาซ้ายให้ตรงเป็นแนวเดียว ค้าง 2–3 วินาที ฝึกความมั่นคงของลำตัว'],
  ['@pilates-hundred', 'พิลาทิส ฮันเดรด', 'Pilates Hundred', 'strength', 'body', 'i', ['abdominals'], ['shoulders', 'hip flexors'], 'w', 'นอนหงาย ยกหัว-ไหล่-ขาลอย ตบแขนขึ้นลงเร็วๆ 100 ครั้ง หายใจเข้า 5 ออก 5'],
  ['@wall-sit', 'นั่งพิงกำแพง', 'Wall Sit', 'strength', 'body', 'b', ['quadriceps', 'glutes'], ['calves', 'abdominals'], 'wk', 'พิงหลังกับผนัง ย่อเข่า 90° ค้างไว้ 20–60 วินาที ง่ายแต่เมื่อยมาก'],
  ['@kneeling-pushup', 'วิดพื้นคุกเข่า', 'Kneeling Push-Up', 'strength', 'body', 'b', ['chest', 'triceps'], ['shoulders', 'abdominals'], 'wk', 'คุกเข่าบนพื้นแทนปลายเท้า เหมาะกับผู้เริ่มต้นหรือเด็ก ลำตัวตรงจากศีรษะถึงเข่า']
];
const WOMEN_EXTRA = new Set(['Barbell_Hip_Thrust', 'Butt_Lift_Bridge', 'Single_Leg_Glute_Bridge', 'Glute_Kickback', 'Goblet_Squat', 'Bodyweight_Squat', 'Dumbbell_Lunges', 'Bodyweight_Walking_Lunge',
  'Split_Squat_with_Dumbbells', 'Dumbbell_Step_Ups', 'Dead_Bug', 'Plank', 'Air_Bike', 'Russian_Twist', 'Superman', 'Side_Lateral_Raise', 'Reverse_Flyes', 'Incline_Push-Up', 'Mountain_Climbers',
  'Dumbbell_Shoulder_Press', 'Seated_Cable_Rows', 'Wide-Grip_Lat_Pulldown', 'Rope_Jumping', 'Walking_Treadmill', 'Dumbbell_Squat', 'Romanian_Deadlift', 'Leg_Press', 'Triceps_Pushdown']);
const KIDS_EXTRA = new Set(['Bodyweight_Squat', 'Incline_Push-Up', 'Plank', 'Superman', 'Mountain_Climbers', 'Rope_Jumping', 'Dead_Bug', 'Butt_Lift_Bridge', 'Bodyweight_Walking_Lunge', 'Crunches', 'Air_Bike']);

/* ---------- รวมข้อมูลทั้งหมด ---------- */
const _CUR = new Map(_EX.map(r => [r[0], r]));
const _DBM = new Map(DB.map(r => [r[0], r]));
const EX = (() => {
  const mk = (id, en, th, cat, eq, lvl, pm, sm, aud) => ({ id, en, th, cat, eq, lvl, pm, sm, aud, m: cat === 'cardio' ? 'cardio' : (GROUP_OF[pm[0]] || 'core'), tip: '', db: true });
  const fromRow = r => mk(r[0], r[1], r[2] || r[1], r[3], r[4], r[5], r[6], r[7], r[8]);
  const out = [];
  _EX.forEach(c => {  // ท่าคัดสรร (ไทยเขียนเอง) มาก่อน
    const r = _DBM.get(c[0]); const e = r ? fromRow(r) : mk(c[0], c[2], c[1], 'strength', c[4], 'b', [], [], '');
    Object.assign(e, { th: c[1], en: c[2], m: c[3], eq: c[4], tip: c[5] });
    if (c[3] === 'cardio') e.cat = 'cardio';
    if (WOMEN_EXTRA.has(e.id) && !e.aud.includes('w')) e.aud += 'w';
    if (KIDS_EXTRA.has(e.id) && !e.aud.includes('k')) e.aud += 'k';
    if (FOCUS[e.id]) e.focus = FOCUS[e.id];
    e.top = true; out.push(e);
  });
  _EXTRA.forEach(x => out.push({ id: x[0], th: x[1], en: x[2], cat: x[3], eq: x[4], lvl: x[5], pm: x[6], sm: x[7], aud: x[8], tip: x[9], m: x[3] === 'cardio' ? 'cardio' : (GROUP_OF[x[6][0]] || 'core'), db: false, top: true }));
  const rank = { strength: 0, stretching: 1, cardio: 2, plyo: 3, special: 4 };
  DB.filter(r => !_CUR.has(r[0])).map(fromRow).sort((a, b) => rank[a.cat] - rank[b.cat]).forEach(e => out.push(e));
  return out;
})();

/* เทมเพลตโปรแกรม: [exId, sets, reps, restSec] */
const TEMPLATES = {
  fat_gym: {
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
  muscle_gym: {
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

TEMPLATES.fat_home = {
  label: 'ลดไขมัน • 3 วัน/สัปดาห์ (ที่บ้าน ไม่ใช้อุปกรณ์)',
  days: [
    { name: 'วันที่ 1 • ทั้งตัว A', items: [
      ['Bodyweight_Squat',3,'15',40],['Pushups',3,'10',40],['Bodyweight_Walking_Lunge',3,'12 ข้าง',40],
      ['Butt_Lift_Bridge',3,'15',30],['Plank',3,'40 วินาที',30],['@jumping-jack',3,'40 วินาที',30]] },
    { name: 'วันที่ 2 • ทั้งตัว B + คาร์ดิโอ', items: [
      ['Freehand_Jump_Squat',3,'12',40],['Superman',3,'12',30],['Mountain_Climbers',3,'30 วินาที',30],
      ['Single_Leg_Glute_Bridge',3,'12 ข้าง',30],['Air_Bike',3,'20',30],['@burpee',3,'10',45]] },
    { name: 'วันที่ 3 • ทั้งตัว C + HIIT', items: [
      ['Glute_Kickback',3,'15 ข้าง',30],['Incline_Push-Up',3,'12',40],['Bench_Dips',3,'12',40],
      ['Dead_Bug',3,'12',30],['Russian_Twist',3,'20',30],['@high-knees',4,'30 วินาที',20],['Rope_Jumping',4,'1 นาที',30]] }
  ]
};
TEMPLATES.muscle_home = {
  label: 'สร้างกล้ามเนื้อ • 4 วัน/สัปดาห์ (ที่บ้าน ดัมเบล+น้ำหนักตัว)',
  days: [
    { name: 'วันที่ 1 • ร่างกายส่วนบน A', items: [
      ['Pushups',4,'10–15',90],['Bent_Over_Two-Dumbbell_Row',4,'10',90],['Dumbbell_Shoulder_Press',3,'10',75],
      ['One-Arm_Dumbbell_Row',3,'10 ข้าง',60],['Dumbbell_Alternate_Bicep_Curl',3,'12',60],['Bench_Dips',3,'12',60]] },
    { name: 'วันที่ 2 • ร่างกายส่วนล่าง A', items: [
      ['Goblet_Squat',4,'10–12',90],['Stiff-Legged_Dumbbell_Deadlift',3,'10',90],['Split_Squat_with_Dumbbells',3,'10 ข้าง',75],
      ['Butt_Lift_Bridge',3,'15',45],['Calf_Raise_On_A_Dumbbell',4,'15',45],['Plank',3,'45 วินาที',30]] },
    { name: 'วันที่ 3 • ร่างกายส่วนบน B', items: [
      ['Decline_Push-Up',4,'8–12',90],['Arnold_Dumbbell_Press',3,'10',75],['Reverse_Flyes',3,'12–15',60],
      ['Side_Lateral_Raise',3,'12–15',45],['Hammer_Curls',3,'12',60],['Dumbbell_Flyes',3,'12',60]] },
    { name: 'วันที่ 4 • ร่างกายส่วนล่าง B', items: [
      ['Dumbbell_Lunges',3,'10 ข้าง',75],['Dumbbell_Step_Ups',3,'10 ข้าง',75],['Single_Leg_Glute_Bridge',3,'12 ข้าง',45],
      ['Dumbbell_Squat',3,'12',75],['Crunches',3,'20',30],['Russian_Twist',3,'20',30]] }
  ]
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
