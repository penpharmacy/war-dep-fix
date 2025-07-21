
function calculate() {
  const inr = parseFloat(document.getElementById("inr").value);
  const bleeding = document.getElementById("bleeding").value;
  const weeklyDose = parseFloat(document.getElementById("weeklyDose").value);
  const resultDiv = document.getElementById("result");

  if (isNaN(inr) || isNaN(weeklyDose)) {
    resultDiv.innerHTML = "กรุณากรอกข้อมูลให้ครบ";
    return;
  }

  let advice = "";
  let doseFactor = 1.0;

  if (bleeding === "yes") {
    advice = "หยุดยา Warfarin และพิจารณาให้ Vitamin K";
    doseFactor = 0;
  } else if (inr < 1.5) {
    advice = "เพิ่มขนาดยา 10-20%";
    doseFactor = 1.15;
  } else if (inr >= 1.5 && inr < 2.0) {
    advice = "เพิ่มขนาดยา 5-10%";
    doseFactor = 1.075;
  } else if (inr >= 2.0 && inr <= 3.0) {
    advice = "คงขนาดยาเดิม";
    doseFactor = 1.0;
  } else if (inr > 3.0 && inr <= 3.5) {
    advice = "ลดขนาดยา 5-10%";
    doseFactor = 0.925;
  } else if (inr > 3.5 && inr <= 4.0) {
    advice = "ลดขนาดยา 10-15%";
    doseFactor = 0.875;
  } else {
    advice = "หยุดยา 1-2 วัน และลดขนาดยา";
    doseFactor = 0.7;
  }

  const newWeeklyDose = weeklyDose * doseFactor;
  const plan = generateOptimizedPlan(newWeeklyDose);

  document.getElementById("result").innerHTML = `
    <strong>คำแนะนำ:</strong> ${advice}<br/>
    <strong>ขนาดยาใหม่ต่อสัปดาห์:</strong> ${newWeeklyDose.toFixed(1)} mg<br/>
    <strong>ตารางการใช้ยา:</strong><br/>${plan.text}
  `;
}

function generateOptimizedPlan(targetDose) {
  const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
  let bestPlan = null;
  let bestDays = [];
  let minDiff = Infinity;

  function getPossibleDoses() {
    const doses = [];
    for (let t2 = 0; t2 <= 4; t2 += 0.5) {
      for (let t3 = 0; t3 <= 4; t3 += 0.5) {
        const total = t2 * 2 + t3 * 3;
        if (total > 0 && total <= 15) {
          doses.push({ dose: total, tab2: t2, tab3: t3 });
        }
      }
    }
    return doses;
  }

  const doseOptions = getPossibleDoses();

  for (let n = 1; n <= 7; n++) {
    const dayCombos = combinations(days, n);
    for (const combo of dayCombos) {
      const picks = pickDoses(combo.length, doseOptions, targetDose);
      if (!picks) continue;
      const sum = picks.reduce((a, b) => a + b.dose, 0);
      const diff = Math.abs(sum - targetDose);
      if (diff < minDiff) {
        minDiff = diff;
        bestPlan = picks;
        bestDays = combo;
      }
    }
  }

  let text = "";
  if (bestPlan) {
    for (let i = 0; i < bestPlan.length; i++) {
      const d = bestPlan[i];
      const parts = [];
      if (d.tab2 > 0) parts.push(`2 mg × ${d.tab2}`);
      if (d.tab3 > 0) parts.push(`3 mg × ${d.tab3}`);
      text += `${bestDays[i]}: ${parts.join(" + ")}<br/>`;
    }
  } else {
    text = "ไม่สามารถคำนวณขนาดยาได้";
  }

  return { text };
}

function combinations(arr, k) {
  const result = [];
  const f = (prefix, start) => {
    if (prefix.length === k) {
      result.push(prefix);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      f([...prefix, arr[i]], i + 1);
    }
  };
  f([], 0);
  return result;
}

function pickDoses(n, options, target) {
  let best = null;
  let minDiff = Infinity;

  const helper = (current, idx) => {
    if (current.length === n) {
      const sum = current.reduce((a, b) => a + b.dose, 0);
      const diff = Math.abs(sum - target);
      if (diff < minDiff) {
        minDiff = diff;
        best = [...current];
      }
      return;
    }
    for (let i = 0; i < options.length; i++) {
      helper([...current, options[i]], i);
    }
  };

  helper([], 0);
  return best;
}



document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("button");
  if (button) {
    button.addEventListener("click", calculate);
  }
});
