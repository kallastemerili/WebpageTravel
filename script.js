// Simple form submission
const form = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

form.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    formMessage.textContent = `Thank you, ${name}! Your message has been sent.`;
    form.reset();
});
