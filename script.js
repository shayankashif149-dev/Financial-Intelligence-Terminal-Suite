document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Initial Engine Calculations
  calculateTax();
  calculateLandedCost();
  calculateInflation();
});

let isFiler = true;
let incomeType = 'salaried';

// 1. TAB SWITCHER LOGIC
function switchTab(tab) {
  ['rates', 'tax', 'cost', 'inflation'].forEach((t) => {
    const viewEl = document.getElementById(`view-${t}`);
    const btnEl = document.getElementById(`tab-${t}`);

    if (viewEl) viewEl.classList.add('hidden');
    if (btnEl) {
      btnEl.className = 'flex-1 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center space-x-2 bg-transparent text-slate-400 hover:text-white hover:bg-slate-900/60';
    }
  });

  const activeView = document.getElementById(`view-${tab}`);
  const activeBtn = document.getElementById(`tab-${tab}`);

  if (activeView) activeView.classList.remove('hidden');
  if (activeBtn) {
    activeBtn.className = 'flex-1 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25';
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// 2. SEARCH FILTER LOGIC FOR RATES
function filterRates() {
  const searchEl = document.getElementById('rate-search');
  if (!searchEl) return;
  const query = searchEl.value.toLowerCase();
  const rows = document.querySelectorAll('#rates-table-body tr');
  rows.forEach((row) => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

// 3. TAX TYPE & FILER TOGGLES
function setIncomeType(type) {
  incomeType = type;
  const bSal = document.getElementById('type-salaried');
  const bBiz = document.getElementById('type-business');

  if (bSal && bBiz) {
    if (incomeType === 'salaried') {
      bSal.className = 'py-2.5 rounded-lg text-xs font-bold transition-all bg-emerald-500 text-slate-950 shadow-md';
      bBiz.className = 'py-2.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white';
    } else {
      bBiz.className = 'py-2.5 rounded-lg text-xs font-bold transition-all bg-emerald-500 text-slate-950 shadow-md';
      bSal.className = 'py-2.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white';
    }
  }
  calculateTax();
}

function setFilerStatus(status) {
  isFiler = status;
  const bFiler = document.getElementById('btn-filer');
  const bNon = document.getElementById('btn-nonfiler');

  if (bFiler && bNon) {
    if (isFiler) {
      bFiler.className = 'py-3 bg-emerald-600 text-white font-black rounded-xl text-xs border border-emerald-500 shadow-lg shadow-emerald-600/20 transition-all';
      bNon.className = 'py-3 bg-slate-900 text-slate-400 font-black rounded-xl text-xs border border-slate-800 transition-all';
    } else {
      bNon.className = 'py-3 bg-rose-600 text-white font-black rounded-xl text-xs border border-rose-500 shadow-lg shadow-rose-600/20 transition-all';
      bFiler.className = 'py-3 bg-slate-900 text-slate-400 font-black rounded-xl text-xs border border-slate-800 transition-all';
    }
  }
  calculateTax();
}

// 4. TAX ENGINE CALCULATOR
function calculateTax() {
  const incomeInput = document.getElementById('tax-income');
  const monthlyGross = incomeInput ? parseFloat(incomeInput.value) || 0 : 0;
  const annualGross = monthlyGross * 12;

  let baseRate = incomeType === 'salaried' ? 2.5 : 5.0;
  if (!isFiler) baseRate *= 2; 

  const monthlyTax = monthlyGross * (baseRate / 100);
  const annualTax = monthlyTax * 12;
  const netMonthly = Math.max(0, monthlyGross - monthlyTax);

  const resRate = document.getElementById('res-tax-rate');
  const resMonthly = document.getElementById('res-tax-monthly');
  const resAnnual = document.getElementById('res-tax-annual');
  const resGrossAnnual = document.getElementById('res-gross-annual');
  const resNet = document.getElementById('res-net-income');

  if (resRate) resRate.innerText = `${baseRate.toFixed(1)}%`;
  if (resMonthly) resMonthly.innerText = `Rs. ${Math.round(monthlyTax).toLocaleString('en-PK')}`;
  if (resAnnual) resAnnual.innerText = `Rs. ${Math.round(annualTax).toLocaleString('en-PK')}`;
  if (resGrossAnnual) resGrossAnnual.innerText = `Rs. ${Math.round(annualGross).toLocaleString('en-PK')}`;
  if (resNet) resNet.innerText = `Rs. ${Math.round(netMonthly).toLocaleString('en-PK')}`;
}

// 5. COMMERCIAL LANDED COST ENGINE CALCULATOR
function calculateLandedCost() {
  const baseUsd = parseFloat(document.getElementById('cost-base')?.value) || 0;
  const exchangeRate = parseFloat(document.getElementById('cost-exchange')?.value) || 0;
  const dutyPct = parseFloat(document.getElementById('cost-duty')?.value) || 0;
  const gstPct = parseFloat(document.getElementById('cost-gst')?.value) || 0;
  const whtPct = parseFloat(document.getElementById('cost-wht')?.value) || 0;
  const freightPkr = parseFloat(document.getElementById('cost-freight')?.value) || 0;
  const marginPct = parseFloat(document.getElementById('cost-margin')?.value) || 0;

  const basePkr = baseUsd * exchangeRate;
  const dutyAmt = basePkr * (dutyPct / 100);
  const gstAmt = (basePkr + dutyAmt) * (gstPct / 100);
  const whtAmt = (basePkr + dutyAmt) * (whtPct / 100);

  const totalDuties = dutyAmt + gstAmt + whtAmt;
  const totalLanded = basePkr + totalDuties + freightPkr;
  const recommendedRrp = totalLanded * (1 + marginPct / 100);

  const resBasePkr = document.getElementById('res-base-pkr');
  const resDuties = document.getElementById('res-total-duties');
  const resLanded = document.getElementById('res-landed-cost');
  const resRrp = document.getElementById('res-rrp');

  if (resBasePkr) resBasePkr.innerText = `Rs. ${Math.round(basePkr).toLocaleString('en-PK')}`;
  if (resDuties) resDuties.innerText = `Rs. ${Math.round(totalDuties).toLocaleString('en-PK')}`;
  if (resLanded) resLanded.innerText = `Rs. ${Math.round(totalLanded).toLocaleString('en-PK')}`;
  if (resRrp) resRrp.innerText = `Rs. ${Math.round(recommendedRrp).toLocaleString('en-PK')}`;
}

// 6. INFLATION ENGINE CALCULATOR
function calculateInflation() {
  const amount = parseFloat(document.getElementById('inf-amount')?.value) || 0;
  const ratePct = parseFloat(document.getElementById('inf-rate')?.value) || 0;
  const years = parseFloat(document.getElementById('inf-years')?.value) || 1;

  const realValue = amount / Math.pow(1 + ratePct / 100, years);
  const lossValue = amount - realValue;

  const resNominal = document.getElementById('res-inf-nominal');
  const resReal = document.getElementById('res-inf-real');
  const resLoss = document.getElementById('res-inf-loss');

  if (resNominal) resNominal.innerText = `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
  if (resReal) resReal.innerText = `Rs. ${Math.round(realValue).toLocaleString('en-PK')}`;
  if (resLoss) resLoss.innerText = `- Rs. ${Math.round(lossValue).toLocaleString('en-PK')}`;
}