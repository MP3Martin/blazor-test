using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;

namespace blazor_client_test.Pages {
	public partial class MyCode2 {
		[Inject]
		public IJSRuntime? JSRuntime { get; set; }
		private static string textOut = "";
		private static int snakeArraySize = 30;
		private void UpdateLastKey(KeyboardEventArgs e) {
			string key = e.Key;
			if (key.Length > 1) goto end;
			char keyChar = key.ToLower().ToCharArray()[0];
			switch (keyChar) {
				case 'w' or 'a' or 's' or 'd':
					var oppositeKeys = new Dictionary<char, char> {
						{'a', 'd'},
						{ 'w', 's'}
					};
					var reversed = oppositeKeys.ToDictionary(x => x.Value, x => x.Key);
					oppositeKeys = oppositeKeys.Concat(reversed).ToDictionary(x => x.Key, x => x.Value);
					reversed = null;
					if (oppositeKeys[keyChar] == snakeGame.lastKey) goto end;
					snakeGame.lastKey = keyChar;
					//JSRuntime.InvokeVoidAsync("console.log", keyChar.ToString());
					break;
			}
		end:
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
			public char lastKey = 'w';
			public void updateSnake() {
				var prevHeadCoords = snakeCoords.Where(x => x.Item2 == 2).First().Item1;
				snakeCoords.Remove((prevHeadCoords, 2));
				snakeCoords.Add((prevHeadCoords, 1));
				snakeCoords.RemoveAt(0);
				var directions = new Dictionary<char, (int, int)> {
					{ 'w', (0, -1)},
					{ 'a', (-1, 0)},
					{ 's', (0, 1)},
					{ 'd', (1, 0)},
				};
				var direction = directions[lastKey];
				snakeCoords.Add(((prevHeadCoords.Item1 + direction.Item1, prevHeadCoords.Item2 + direction.Item2), 2));
				snakeArray = new int[gameSize.Item1, gameSize.Item2];
				for (int i = 0; i < snakeArray.GetLength(0); i++) {
					for (int j = 0; j < snakeArray.GetLength(1); j++) {
						if (snakeCoords.Contains(((i, j), 1)) || snakeCoords.Contains(((i, j), 2))) {
							snakeArray[i, j] = 1;
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
			}, 100);
		}
	}
}