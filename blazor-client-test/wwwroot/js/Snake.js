clearSnakeControlInput = () => {
  setTimeout(() => {
    document.getElementById('snake_control_input').value = '';
  }, 0);
};

focusInterval = setInterval(() => {
  try {
    document.getElementById('snake_control_input').focus();
  } catch (e) { }
}, 50);
document.getElementById('snake_control_input').addEventListener('focusout', () => {
  document.getElementById('snake_control_input').focus();
});
clearInterval(focusInterval);
