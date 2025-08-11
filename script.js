function calculateWarfarinDose() {
  const weeklyDose = parseFloat(document.getElementById('weeklyDose').value);
  const INR = parseFloat(document.getElementById('currentINR').value);
  const days = parseInt(document.getElementById('days').value);
  const tabletChoice = document.getElementById('tabletChoice').value;

  if(isNaN(weeklyDose) || weeklyDose <= 0 || isNaN(INR) || INR <= 0 || isNaN(days) || days <= 0) {
    alert('กรุณากรอกข้อมูลให้ถูกต้องครบถ้วน');
    return;
  }

  let adjustPercent = 0;
  let advice = '';

  if(INR < 1.5) {
    adjustPercent = 0.15;
    advice = 'เพิ่มขนาดยารายสัปดาห์ 10–20%';
  } else if(INR >= 1.5 && INR <= 1.9) {
    adjustPercent = 0.075;
    advice = 'เพิ่ม 5–10% หรือไม่ต้องปรับ แต่ติดตามค่า INR บ่อยขึ้น';
  } else if(INR >= 2.0 && INR <= 3.0) {
    adjustPercent = 0;
    advice = 'ไม่ต้องปรับยา';
  } else if(INR >= 3.1 && INR <= 3.9) {
    adjustPercent = -0.075;
    advice = 'ลดขนาดยารายสัปดาห์ 5–10%';
  } else if(INR > 3.9 && INR <= 5.0) {
    adjustPercent = -0.10;
    advice = 'หยุดยา 1 วัน แล้วกลับมาเริ่มด้วยขนาดที่ลดลง 10% (ไม่มีเลือดออก)';
  } else if(INR > 5.0 && INR <= 9.0) {
    adjustPercent = -0.20;
    advice = 'หยุดยา 2 วัน แล้วกลับมาเริ่มด้วยขนาดที่ลดลง 20%, พิจารณาให้ Vitamin K1 1–2.5 mg (ไม่มีเลือดออก)';
  } else if(INR > 9.0) {
    adjustPercent = 0;
    advice = 'หยุดยา ให้ Vitamin K1 2.5–5 mg รับประทาน และติดตาม INR อย่างใกล้ชิด (ไม่มีเลือดออก)';
  }

  let newWeeklyDose = weeklyDose;
  if(INR <= 9.0) {
    newWeeklyDose = weeklyDose * (1 + adjustPercent);
    newWeeklyDose = Math.max(newWeeklyDose, 0);
  } else {
    newWeeklyDose = 0;
  }

  let dailyDose = newWeeklyDose / days;

  let dailyTablets = [];
  if (tabletChoice === '2') {
    dailyTablets = Array(days).fill(dailyDose / 2);
  } else if (tabletChoice === '3') {
    dailyTablets = Array(days).fill(dailyDose / 3);
  } else if (tabletChoice === '5') {
    dailyTablets = Array(days).fill(dailyDose / 5);
  } else if (tabletChoice === 'both') {
    dailyTablets = [];
    for(let i=0; i<days; i++) {
      if(i%2 === 0) {
        dailyTablets.push(dailyDose / 3);
      } else {
        dailyTablets.push(dailyDose / 2);
      }
    }
  }

  function formatTablets(doseMg, tabletMg) {
    const tablets = doseMg / tabletMg;
    const rounded = Math.round(tablets * 4) / 4;
    return rounded;
  }

  let dailyTabletsRounded = [];
  if (tabletChoice === 'both') {
    for(let i=0; i<days; i++) {
      const tabletMg = (i%2 === 0) ? 3 : 2;
      dailyTabletsRounded.push(formatTablets(dailyDose, tabletMg));
    }
  } else {
    const tabletMg = tabletChoice === '5' ? 5 : Number(tabletChoice);
    for(let i=0; i<days; i++) {
      dailyTabletsRounded.push(formatTablets(dailyDose, tabletMg));
    }
  }

  let resultText = `<h3>ผลการคำนวณ</h3>`;
  resultText += `<p>ค่า INR ปัจจุบัน: <b>${INR.toFixed(2)}</b></p>`;
  resultText += `<p>ขนาดยาเดิมรายสัปดาห์: <b>${weeklyDose.toFixed(2)} mg</b></p>`;
  if (newWeeklyDose === 0) {
    resultText += `<p><b>หยุดยา Warfarin ตามคำแนะนำ</b></p>`;
  } else {
    resultText += `<p>ขนาดยาใหม่รายสัปดาห์: <b>${newWeeklyDose.toFixed(2)} mg</b></p>`;
    resultText += `<p>ขนาดยาเฉลี่ยรายวัน: <b>${dailyDose.toFixed(2)} mg/วัน</b></p>`;
  }

  resultText += `<h4>คำแนะนำ</h4><p>${advice}</p>`;

  if(newWeeklyDose > 0){
    resultText += `<h4>จำนวนเม็ดที่แนะนำต่อวัน (ปัดเศษ 0.25 เม็ด)</h4>`;
    for(let i=0; i<days; i++){
      let tabletMg = tabletChoice === '5' ? 5 : (tabletChoice === 'both' ? (i%2 === 0 ? 3 : 2) : Number(tabletChoice));
      resultText += `<p>วัน${i+1}: ${dailyTabletsRounded[i]} เม็ดขนาด ${tabletMg} mg</p>`;
    }
  }

  document.getElementById('result').style.display = 'block';
  document.getElementById('result').innerHTML = resultText;
  document.getElementById('warning').style.display = 'none';
}