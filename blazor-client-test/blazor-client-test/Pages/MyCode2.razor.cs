using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;

namespace blazor_client_test.Pages {
	public partial class MyCode2 {
		[Inject]
		public IJSRuntime? JSRuntime { get; set; }
		private static string textOut = "";
		private static int snakeArraySize = 30;
		private void ChangeDirection(KeyboardEventArgs e) {
			string key = e.Key;
			char keyChar = key.ToLower().ToCharArray()[0];
			switch (keyChar) {
				case 'w' or 'a' or 's' or 'd':
					snakeGame.lastKey = keyChar;
					JSRuntime.InvokeVoidAsync("console.log", keyChar.ToString());
					break;
			}
			JSRuntime.InvokeVoidAsync("clearSnakeControlInput");
		}

		private class SnakeGame {
			private static (int, int) gameSize = (0, 0);
			public SnakeGame((int, int) gameSizeArg) {
				gameSize = gameSizeArg;
				snakeArray = new int[gameSize.Item1, gameSize.Item2];
				try {
					snakeCoords.Add(((gameSize.Item1 / 2, gameSize.Item2 / 2), 2));
					snakeCoords.Add(((gameSize.Item1 / 2, (gameSize.Item2 / 2) - 1), 1));
				} catch (Exception) { }

			}
			public int[,] snakeArray = new int[gameSize.Item1, gameSize.Item2];
			// ((snakeX, snakeY), data)
			// data: 1 = snake, 2 = snake head
			private List<((int, int), int)> snakeCoords = new();
			public char lastKey = new();
			public void updateSnake() {
				//if (lastKey == 'w') {
				//	snakeCoords.Add(((1, 1), 1));
				//} else {
				//	snakeCoords.Clear();
				//}
				snakeArray = new int[gameSize.Item1, gameSize.Item2];
				for (int i = 0; i < snakeArray.GetLength(0); i++) {
					for (int j = 0; j < snakeArray.GetLength(1); j++) {
						if (snakeCoords.Contains(((i, j), 1)) || snakeCoords.Contains(((i, j), 2))) {
							snakeArray[j, i] = 1;
						}
					}
				}
			}
		}

		private SnakeGame snakeGame = new((snakeArraySize, snakeArraySize));
		private void OnPageLoad() {
			App.CreateTimer(() => {
				snakeGame.updateSnake();
				InvokeAsync(StateHasChanged);
			}, 50);
		}
	}
}