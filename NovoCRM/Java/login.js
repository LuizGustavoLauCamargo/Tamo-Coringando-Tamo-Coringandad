document.addEventListener('DOMContentLoaded', () => {
  const pwInput = document.getElementById('pw');
  const togglePw = document.getElementById('togglePw');
  const formTitle = document.getElementById('form-title');
  const toggleFormLink = document.getElementById('toggle-form');
  const submitButton = document.querySelector('.input-login');
  let isLogin = true;

  togglePw.addEventListener('click', () => {
    const currentType = pwInput.getAttribute('type');
    pwInput.setAttribute('type', currentType === 'password' ? 'text' : 'password');
    togglePw.classList.toggle('bx-show');
    togglePw.classList.toggle('bx-hide');
  });

  toggleFormLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    if (isLogin) {
      formTitle.textContent = 'Login';
      submitButton.value = 'Entrar';
      toggleFormLink.textContent = 'Registrar';
    } else {
      formTitle.textContent = 'Registrar';
      submitButton.value = 'Registrar';
      toggleFormLink.textContent = 'Voltar ao Login';
    }
  });
});
