document.getElementById('warfarinForm').addEventListener('submit', function () {
  const INR = parseFloat(document.getElementById('currentINR').value);
  const weeklyDose = parseFloat(document.getElementById('weeklyDose').value);
  const days = parseInt(document.getElementById('days').value);

  if (isNaN(INR) || INR <= 0) {
    alert('กรุณากรอกค่า INR ให้ถูกต้อง');
    return;
  }
  if (isNaN(weeklyDose) || weeklyDose <= 0) {
    alert('กรุณากรอกขนาดยาเดิมต่อสัปดาห์ให้ถูกต้อง');
    return;
  }
  if (isNaN(days) || days <= 0) {
    alert('กรุณากรอกจำนวนวันนัดให้ถูกต้อง');
    return;
  }

  const tabletChoice = document.querySelector('input[name="tablet"]:checked')?.value;
  if (!tabletChoice) {
    alert('กรุณาเลือกขนาดเม็ดยาที่ใช้');
    return;
  }

  const bleedingStatus = document.querySelector('input[name="bleeding"]:checked')?.value;

  if (bleedingStatus === 'yes') {
    showResult('ผู้ป่วยมีภาวะเลือดออก ต้องหยุดยาและรีบแจ้งแพทย์ทันที');
    return;
  }

  let lowAdjust, highAdjust, advice = '';

  if (INR < 1.5) {
    lowAdjust = 0.10;
    highAdjust = 0.20;
    advice = 'เพิ่มขนาดยารายสัปดาห์ 10–20%';
  } else if (INR >= 1.5 && INR <= 1.9) {
    lowAdjust = 0.05;
    highAdjust = 0.10;
    advice = 'เพิ่ม 5–10% หรือไม่ต้องปรับ แต่ติดตามค่า INR บ่อยขึ้น';
  } else if (INR >= 2.0 && INR <= 3.0) {
    lowAdjust = 0;
    highAdjust = 0;
    advice = 'ไม่ต้องปรับยา';
  } else if (INR >= 3.1 && INR <= 3.9) {
    lowAdjust = -0.10;
    highAdjust = -0.05;
    advice = 'ลดขนาดยารายสัปดาห์ 5–10%';
  } else if (INR > 3.9 && INR <= 5.0) {
    lowAdjust = -0.10;
    highAdjust = -0.10;
    advice = 'หยุดยา 1 วัน แล้วกลับมาเริ่มด้วยขนาดที่ลดลง 10% (ไม่มีเลือดออก)';
  } else if (INR > 5.0 && INR <= 9.0) {
    lowAdjust = -0.20;
    highAdjust = -0.20;
    advice = 'หยุดยา 2 วัน แล้วกลับมาเริ่มด้วยขนาดที่ลดลง 20%, พิจารณาให้ Vitamin K1 1–2.5 mg (ไม่มีเลือดออก)';
  } else if (INR > 9.0) {
    advice = 'หยุดยา ให้ Vitamin K1 2.5–5 mg รับประทาน และติดตาม INR อย่างใกล้ชิด (ไม่มีเลือดออก)';
    showResult(advice);
    return;
  }

  const newDoseLow = Math.max(weeklyDose * (1 + lowAdjust), 0);
  const newDoseHigh = Math.max(weeklyDose * (1 + highAdjust), 0);

  function distributeTablets(totalMg, tabletChoice) {
    let plan = [];
    const daysInWeek = 7;
    for(let i=0; i<daysInWeek; i++) plan.push({t3:0, t2:0, t5:0});

    if (tabletChoice === "3") {
      let tabletsPerDay = totalMg / (3 * daysInWeek);
      tabletsPerDay = Math.round(tabletsPerDay * 2) / 2;
      for(let i=0; i<daysInWeek; i++) plan[i].t3 = tabletsPerDay;
    } else if (tabletChoice === "2") {
      let tabletsPerDay = totalMg / (2 * daysInWeek);
      tabletsPerDay = Math.round(tabletsPerDay * 2) / 2;
      for(let i=0; i<daysInWeek; i++) plan[i].t2 = tabletsPerDay;
    } else if (tabletChoice === "2+3" || tabletChoice === "both") {
      const totalTablets = totalMg / 7;
      let bestPlan = null;
      let bestDiff = Infinity;
      for(let t3=0; t3<=2; t3+=0.5) {
        for(let t2=0; t2<=2; t2+=0.5) {
          let sum = t3*3 + t2*2;
          let diff = Math.abs(sum - totalTablets);
          if(diff < bestDiff) {
            bestDiff = diff;
            bestPlan = {t3, t2};
          }
        }
      }
      for(let i=0; i<daysInWeek; i++) {
        plan[i].t3 = bestPlan.t3;
        plan[i].t2 = bestPlan.t2;
      }
    }
    return plan;
  }

  function planToHTML(plan, title){
    let html = `<h3>แผนการให้ยา 7 วัน (${title})</h3>`;
    html += '<table><thead><tr><th>วัน</th><th>3 mg (เม็ด)</th><th>2 mg (เม็ด)</th><th>รวม mg</th></tr></thead><tbody>';
    let total3 = 0, total2 = 0;
    const dayNames = ['จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์','อาทิตย์'];

    for(let i=0; i<7; i++){
      const d = plan[i];
      const sumMg = d.t3*3 + d.t2*2;
      total3 += d.t3;
      total2 += d.t2;
      html += `<tr><td>${dayNames[i]}</td><td>${d.t3.toFixed(1)}</td><td>${d.t2.toFixed(1)}</td><td>${sumMg.toFixed(1)}</td></tr>`;
    }
    const totalMg = total3*3 + total2*2;
    html += `<tr style="font-weight:bold; background:#ffe6f0;"><td>รวม</td><td>${total3.toFixed(1)}</td><td>${total2.toFixed(1)}</td><td>${totalMg.toFixed(1)}</td></tr>`;
    html += '</tbody></table>';
    return html;
  }

  const planLow = distributeTablets(newDoseLow, tabletChoice);
  const planHigh = distributeTablets(newDoseHigh, tabletChoice);

  let recHtml = `<p>คำแนะนำ: ${advice}</p>`;
  recHtml += `<p>ขนาดยาเดิมรายสัปดาห์: ${weeklyDose.toFixed(2)} mg</p>`;
  recHtml += `<p>ช่วงขนาดยาใหม่ต่อสัปดาห์: ${newDoseLow.toFixed(2)} mg ถึง ${newDoseHigh.toFixed(2)} mg</p>`;

  document.getElementById('recommendation').innerHTML = recHtml;
  document.getElementById('doseRange').innerHTML = '';
  document.getElementById('planLow').innerHTML = planToHTML(planLow, 'ต่ำสุด');
  document.getElementById('planHigh').innerHTML = planToHTML(planHigh, 'สูงสุด');

  function totalTabletsForDays(plan, days) {
    let total3 = 0, total2 = 0;
    for(let i=0; i<days; i++) {
      total3 += plan[i%7].t3;
      total2 += plan[i%7].t2;
    }
    return {total3, total2};
  }

  const totalLow = totalTabletsForDays(planLow, days);
  const totalHigh = totalTabletsForDays(planHigh, days);

  let totalHtml = `<h3>จำนวนเม็ดที่ต้องจ่ายสำหรับ ${days} วันนัด</h3>`;
  totalHtml += `<p>ช่วงต่ำสุด: 3 mg = ${totalLow.total3.toFixed(1)} เม็ด, 2 mg = ${totalLow.total2.toFixed(1)} เม็ด</p>`;
  totalHtml += `<p>ช่วงสูงสุด: 3 mg = ${totalHigh.total3.toFixed(1)} เม็ด, 2 mg = ${totalHigh.total2.toFixed(1)} เม็ด</p>`;

  document.getElementById('totalTablets').innerHTML = totalHtml;
  document.getElementById('resultSection').style.display = 'block';
});

function showResult(text) {
  document.getElementById('recommendation').innerHTML = `<p>${text}</p>`;
  document.getElementById('doseRange').innerHTML = '';
  document.getElementById('planLow').innerHTML = '';
  document.getElementById('planHigh').innerHTML = '';
  document.getElementById('totalTablets').innerHTML = '';
  document.getElementById('resultSection').style.display = 'block';
}
