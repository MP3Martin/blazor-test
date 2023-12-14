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
			if (keyChar == snakeGame.lastKey) {
				goto end;
			}
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
					snakeGame.updateSnake();
					break;
			}
		end:
			JSRuntime.InvokeVoidAsync("clearSnakeControlInput");
		}

		private class SnakeGame {
			private static (int, int) gameSize = (0, 0);
			public SnakeGame((int, int) aGameSize) {
				gameSize = aGameSize;
				snakeArray = new int[gameSize.Item1, gameSize.Item2];
				try {
					int initialSnakeSize = (int)(gameSize.Item2 * 0.2);
					for (int i = 0; i < initialSnakeSize; i++) {
						snakeCoordsList.Add(((gameSize.Item1 / 2, (int)(gameSize.Item2 / 1.5) - i), (i == initialSnakeSize - 1) ? 2 : 1));
					}
				} catch (Exception) { }

			}
			public int[,] snakeArray = new int[gameSize.Item1, gameSize.Item2];
			// ((snakeX, snakeY), data)
			// data: 1 = snake, 2 = snake head
			private List<((int, int), int)> snakeCoordsList = new();
			public char lastKey = 'w';
			public void updateSnake() {
				var prevHeadCoords = snakeCoordsList.Where(x => x.Item2 == 2).First().Item1;
				snakeCoordsList.Remove((prevHeadCoords, 2));
				snakeCoordsList.Add((prevHeadCoords, 1));
				snakeCoordsList.RemoveAt(0);
				var directions = new Dictionary<char, (int, int)> {
					{ 'w', (0, -1)},
					{ 'a', (-1, 0)},
					{ 's', (0, 1)},
					{ 'd', (1, 0)}
				};
				var direction = directions[lastKey];
				var newCoords = (prevHeadCoords.Item1 + direction.Item1, prevHeadCoords.Item2 + direction.Item2);
				if (newCoords.Item1 >= gameSize.Item1) {
					newCoords.Item1 = 0;
				} else if (newCoords.Item2 >= gameSize.Item2) {
					newCoords.Item2 = 0;
				} else if (newCoords.Item1 < 0) {
					newCoords.Item1 = gameSize.Item1 - 1;
				} else if (newCoords.Item2 < 0) {
					newCoords.Item2 = gameSize.Item2 - 1;
				}
				snakeCoordsList.Add((newCoords, 2));
				snakeArray = new int[gameSize.Item1, gameSize.Item2];
				for (int i = 0; i < snakeArray.GetLength(0); i++) {
					for (int j = 0; j < snakeArray.GetLength(1); j++) {
						if (snakeCoordsList.Contains(((i, j), 1))) {
							snakeArray[i, j] = 1;
						} else if (snakeCoordsList.Contains(((i, j), 2))) {
							snakeArray[i, j] = 2;
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
			}, 200);
			snakeGame.updateSnake();
			InvokeAsync(StateHasChanged);
		}
	}
}