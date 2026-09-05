const $ = id => document.getElementById(id);
const views = document.querySelectorAll('.view');
const state = {
  authTab: 'register', pinLength: 4, activeFlow: null, cardPhoto: null, docPhoto: null,
  business: {}, documentsProfile: {}, documents: [], currency: 'XOF'
};

function showView(id) {
  views.forEach(v => v.classList.add('hidden'));
  $(id).classList.remove('hidden');
  window.scrollTo({top:0, behavior:'smooth'});
}
function modal(title, text) {
  $('modalTitle').textContent = title;
  $('modalText').textContent = text;
  $('modal').classList.remove('hidden');
}
$('modalClose').onclick = () => $('modal').classList.add('hidden');

function saveSession() {
  localStorage.setItem('mera_tsa_state', JSON.stringify({
    hasAccount: !!localStorage.getItem('mera_tsa_user'),
    pin: localStorage.getItem('mera_tsa_pin'),
    pinLength: localStorage.getItem('mera_tsa_pin_length')
  }));
}
function startApp() {
  $('splashScreen').addEventListener('animationend', () => {
    $('splashScreen').remove();
    $('app').classList.remove('hidden');
    const user = localStorage.getItem('mera_tsa_user');
    const pin = localStorage.getItem('mera_tsa_pin');
    if (user && pin) showView('lockView');
    else if (user) showView('pinSetupView');
    else showView('authView');
  }, {once:true});
}
startApp();

document.querySelectorAll('[data-auth-tab]').forEach(btn => btn.onclick = () => {
  document.querySelectorAll('[data-auth-tab]').forEach(x => x.classList.remove('active'));
  btn.classList.add('active');
  $('registerForm').classList.toggle('hidden', btn.dataset.authTab !== 'register');
  $('loginForm').classList.toggle('hidden', btn.dataset.authTab !== 'login');
});

$('registerForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = $('registerEmail').value.trim();
  const password = $('registerPassword').value;
  if (password !== $('registerConfirmPassword').value) return modal('Mot de passe', 'Les mots de passe ne correspondent pas.');
  localStorage.setItem('mera_tsa_user', JSON.stringify({email, password}));
  saveSession();
  showView('pinSetupView');
});
$('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem('mera_tsa_user') || 'null');
  if (!user || user.email !== $('loginEmail').value.trim() || user.password !== $('loginPassword').value) return modal('Connexion impossible', 'Identifiants incorrects dans ce prototype.');
  showView(localStorage.getItem('mera_tsa_pin') ? 'lockView' : 'pinSetupView');
});

document.querySelectorAll('.pin-length').forEach(btn => btn.onclick = () => {
  state.pinLength = Number(btn.dataset.pinLength);
  document.querySelectorAll('.pin-length').forEach(x => x.classList.toggle('active', x === btn));
  $('newPin').maxLength = state.pinLength;
  $('confirmPin').maxLength = state.pinLength;
});
$('savePinBtn').onclick = () => {
  const pin = $('newPin').value.replace(/\D/g,'');
  const confirm = $('confirmPin').value.replace(/\D/g,'');
  if (pin.length !== state.pinLength || pin !== confirm) return modal('Code incorrect', `Utilisez et confirmez exactement ${state.pinLength} chiffres.`);
  localStorage.setItem('mera_tsa_pin', pin);
  localStorage.setItem('mera_tsa_pin_length', state.pinLength);
  showView('choiceView');
};
$('unlockBtn').onclick = () => {
  if ($('unlockPin').value === localStorage.getItem('mera_tsa_pin')) {
    $('unlockPin').value = '';
    showView('choiceView');
  } else modal('Accès refusé', 'Le code de verrouillage est incorrect.');
};
$('manualLockBtn').onclick = () => showView('lockView');
$('logoutBtn').onclick = () => { localStorage.removeItem('mera_tsa_user'); showView('authView'); };

$('goBusinessCard').onclick = () => { state.activeFlow='business'; showView('businessCardView'); };
$('goDocuments').onclick = () => { state.activeFlow='documents'; showView('documentsProfileView'); };

function previewFile(input, preview, key) {
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { state[key] = reader.result; preview.src = reader.result; };
    reader.readAsDataURL(file);
  });
}
previewFile($('cardPhoto'), $('cardPhotoPreview'), 'cardPhoto');
previewFile($('docPhoto'), $('docPhotoPreview'), 'docPhoto');

$('businessCardForm').addEventListener('submit', e => {
  e.preventDefault();
  state.business = {
    lastName:$('cardLastName').value, firstName:$('cardFirstName').value,
    email:$('cardEmail').value, location:$('cardLocation').value,
    domain:$('cardDomain').value, job:$('cardJob').value, photo:state.cardPhoto
  };
  $('businessReviewContent').innerHTML = `<h3>Vérifiez vos informations</h3>
  <p><b>Nom :</b> ${escapeHtml(state.business.lastName)}</p>
  <p><b>Prénom :</b> ${escapeHtml(state.business.firstName)}</p>
  <p><b>E-mail :</b> ${escapeHtml(state.business.email)}</p>
  <p><b>Lieu :</b> ${escapeHtml(state.business.location)}</p>
  <p><b>Domaine :</b> ${escapeHtml(state.business.domain)}</p>
  <p><b>Métier :</b> ${escapeHtml(state.business.job)}</p>
  <div class="warning-box">Après validation, les informations et la personnalisation seront modifiables selon la règle mensuelle prévue.</div>`;
  showView('businessReviewView');
});
$('businessReviewContinue').onclick = () => { state.activeFlow='business'; showView('subscriptionView'); };

$('documentsProfileForm').addEventListener('submit', e => {
  e.preventDefault();
  state.documentsProfile = {
    lastName:$('docLastName').value, firstName:$('docFirstName').value,
    code:$('countryCode').value, phone:$('docPhone').value, photo:state.docPhoto
  };
  state.activeFlow='documents';
  modal('Informations vérifiées', 'Après validation du profil, vos informations principales ne pourront être modifiées qu’après le délai mensuel prévu.');
  showView('subscriptionView');
});

$('subscriptionBackBtn').onclick = () => showView(state.activeFlow==='business' ? 'businessReviewView' : 'documentsProfileView');

const prices = {
  XOF:{monthly:'2 000 FCFA',annual:'7 000 FCFA'},
  EUR:{monthly:'≈ 3 €',annual:'≈ 11 €'},
  USD:{monthly:'≈ 3 $',annual:'≈ 12 $'}
};
document.querySelectorAll('.currency-btn').forEach(btn => btn.onclick = () => {
  state.currency = btn.dataset.currency;
  document.querySelectorAll('.currency-btn').forEach(x => x.classList.toggle('active',x===btn));
  $('monthlyPrice').textContent=prices[state.currency].monthly;
  $('annualPrice').textContent=prices[state.currency].annual;
});
$('payBtn').onclick = () => {
  if (!$('paymentMethod').value) return modal('Paiement', 'Choisissez d’abord un moyen de paiement.');
  // Payment gateway placeholder: real integrations must be server-side.
  localStorage.setItem('mera_tsa_pending_flow', state.activeFlow);
  showView('pendingView');
};
$('pendingHomeBtn').onclick = () => showView('choiceView');

function renderBusinessCard() {
  $('resultName').textContent = `${state.business.firstName || ''} ${state.business.lastName || ''}`.trim();
  $('resultJob').textContent = state.business.job || '';
  $('resultDomain').textContent = state.business.domain || '';
  $('resultEmail').textContent = state.business.email || '';
  $('resultLocation').textContent = state.business.location || '';
  if (state.business.photo) $('resultPhoto').src = state.business.photo;
  showView('cardResultView');
}
function renderDocuments() {
  $('documentCount').textContent = `${state.documents.length} / 15 documents`;
  $('documentList').innerHTML = state.documents.map((doc,i)=>`
    <div class="document-item"><div><strong>📄 ${escapeHtml(doc.name)}</strong><small>Ajouté dans Mera TSA</small></div>
    <div class="document-actions">
      <button data-share="${i}">Partager</button>
      <button data-download="${i}">Télécharger</button>
      <button data-delete="${i}">Supprimer</button>
    </div></div>`).join('');
  document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{state.documents.splice(Number(b.dataset.delete),1);renderDocuments();});
  document.querySelectorAll('[data-download]').forEach(b=>b.onclick=()=>downloadDoc(Number(b.dataset.download)));
  document.querySelectorAll('[data-share]').forEach(b=>b.onclick=()=>shareDoc(Number(b.dataset.share)));
  showView('documentsVaultView');
}

// Demo activation for development only.
window.meraDemoActivate = () => {
  if (state.activeFlow === 'business') renderBusinessCard();
  else renderDocuments();
};

$('documentUpload').addEventListener('change', () => {
  const file = $('documentUpload').files[0];
  if (!file) return;
  if (state.documents.length >= 15) return modal('Limite atteinte', 'Vous pouvez enregistrer jusqu’à 15 documents.');
  const reader = new FileReader();
  reader.onload = () => { state.documents.push({name:file.name,data:reader.result,type:file.type}); renderDocuments(); };
  reader.readAsDataURL(file);
  $('documentUpload').value='';
});
function downloadDoc(i){
  const d=state.documents[i], a=document.createElement('a'); a.href=d.data;a.download=d.name;a.click();
}
async function shareDoc(i){
  const d=state.documents[i];
  if (navigator.share) { try { await navigator.share({title:'Document Mera TSA',text:d.name}); } catch(e){} }
  else modal('Partage', 'Le partage natif dépend du navigateur et de l’appareil.');
}

$('themeBtn').onclick=()=> $('themePicker').classList.toggle('hidden');
const themes=['brown','blue','red','black','beige','green','purple'];
$('themePicker').innerHTML=themes.map(t=>`<button class="theme-dot theme-${t}" data-theme="${t}" aria-label="${t}"></button>`).join('');
document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{
  $('businessCardPreview').className='business-card theme-'+b.dataset.theme;
});

$('downloadPdfBtn').onclick = () => {
  window.print();
};

document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>showView(b.dataset.back));

function escapeHtml(s=''){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
