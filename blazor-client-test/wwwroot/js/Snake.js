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

onPageLoad = () => {
    setTimeout(() => {
        document.getElementById('snake_control_input').addEventListener('focusout', () => {
            setTimeout(() => {
                document.getElementById('snake_control_input').focus();
            }, 1);
        });
        document.getElementById('snake_control_input').focus();
    }, 10);
}
