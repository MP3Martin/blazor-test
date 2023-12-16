using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;


namespace blazor_client_test.Pages {
	public partial class Snake {
		[Inject]
		public IJSRuntime? JSRuntime { get; set; }
		[Inject]
		public NavigationManager? NavigationManager { get; set; }

		private static string textOut = "";
		private static int snakeArraySize = 30;
		private void UpdateLastKey(KeyboardEventArgs e) {
			string key = e.Key;
			key = key switch {
				"ArrowUp" => "w",
				"ArrowLeft" => "a",
				"ArrowDown" => "s",
				"ArrowRight" => "d",
				_ => key
			};
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
					snakeGame.UpdateSnake(true);
					break;
			}
		end:
			JSRuntime?.InvokeVoidAsync("clearSnakeControlInput");
		}

		private class SnakeGame {
			[Inject]
			public IJSRuntime? JSRuntime { get; set; }

			private static (int, int) gameSize = (0, 0);
			public SnakeGame((int, int)? aGameSize = null) {
				gameSize = aGameSize == null ? (snakeArraySize, snakeArraySize) : ((int, int))aGameSize;
				snakeArray = new int[gameSize.Item1, gameSize.Item2];
				try {
					int initialSnakeSize = Math.Max(1, (int)(gameSize.Item2 * 0.2));
					for (int i = 0; i < initialSnakeSize; i++) {
						snakeCoordsList.Add(((gameSize.Item1 / 2, (int)(gameSize.Item2 / 1.5) - i), (i == initialSnakeSize - 1) ? 2 : 1));
					}
				} catch (Exception) { }
				CreateFood();
			}
			public int[,] snakeArray = new int[gameSize.Item1, gameSize.Item2];
			// ((snakeX, snakeY), data)
			// data: 1 = snake, 2 = snake head, 3 = food
			private List<((int, int), int)> snakeCoordsList = new();
			public char lastKey = 'w';
			private void CreateFood(int attempts = 1) {
				(int, int) FindPosSlow() {
					for (int j = 0; j < snakeArray.GetLength(1); j++) {
						for (int i = 0; i < snakeArray.GetLength(0); i++) {
							if (!snakeCoordsList.Where(x => x.Item1 == (i, j)).Any()) {
								return (i, j);
							}
						}
					}
					return (0, 0);
				}

				// find random pos
				int randX = new Random().Next(0, gameSize.Item1);
				int randY = new Random().Next(0, gameSize.Item2);

				if (attempts > (Math.Max(gameSize.Item1, gameSize.Item2) * 7)) {
					PlaceFoodError?.Invoke(1);
					return;
				} else if (attempts > Math.Max(gameSize.Item1, gameSize.Item2) * 2) {
					// slow method to place food if too many attempts
					(randX, randY) = FindPosSlow();
				}

				// check if the random pos is empty, recursively retry if not
				if (!snakeCoordsList.Where(x => x.Item1 == (randX, randY)).Any()) {
					snakeCoordsList.Add(((randX, randY), 3));
					UpdateRender();
				} else {
					CreateFood(attempts + 1);
				}
			}

			private string HandleHit((int, int) coords) {
				int coordData = snakeCoordsList.Where(x => x.Item1 == coords).First().Item2;
				string strOut = "";
				if (coordData == 3) strOut += "eatFood,";
				return strOut;
			}

			public Action UpdateRender = () => { };

			public void UpdateSnake(bool manual = false) {
				if (manual) {
					try {
						updateSnakeTimer.Stop();
						updateSnakeTimer.Start();
					} catch (Exception) { }
				}
				var prevHeadCoords = snakeCoordsList.Where(x => x.Item2 == 2).First().Item1;

				// calculate new head coords
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

				string hitDataOutput = "";
				if (snakeCoordsList.Where(x => x.Item1 == newCoords).Any())
					hitDataOutput = HandleHit(newCoords);


				// replace old head with snake
				snakeCoordsList.Remove((prevHeadCoords, 2));
				snakeCoordsList.Add((prevHeadCoords, 1));
				// remove last snake bit (only if snake didn't eat food)
				if (!hitDataOutput.Contains("eatFood"))
					snakeCoordsList.Remove(snakeCoordsList.Where(x => x.Item2 == 1).First());

				// add the new head
				snakeCoordsList.Add((newCoords, 2));

				if (hitDataOutput.Contains("eatFood")) {
					snakeCoordsList.RemoveAll(x => x.Item2 == 3);
					CreateFood();
				}

				// update the snakeArray with snakeCoordsList
				snakeArray = new int[gameSize.Item1, gameSize.Item2];
				foreach (var item in snakeCoordsList) {
					// rendering order from most to least important
					if (item.Item2 == 2) {
						snakeArray[item.Item1.Item1, item.Item1.Item2] = 2;
					} else if (item.Item2 == 1) {
						snakeArray[item.Item1.Item1, item.Item1.Item2] = 1;
					} else if (item.Item2 == 3) {
						snakeArray[item.Item1.Item1, item.Item1.Item2] = 3;
					}
				}
			}
			public System.Timers.Timer updateSnakeTimer = new();
			public Action<int>? PlaceFoodError;
		}

		private SnakeGame snakeGame = new();
		private void OnPageLoad(dynamic pageLoadData) {
			(int, int) gameSize = (snakeArraySize, snakeArraySize);
			if (pageLoadData.size != null) {
				snakeArraySize = pageLoadData.size;
			}

			snakeGame = new SnakeGame((snakeArraySize, snakeArraySize));
			snakeGame.UpdateRender = () => { InvokeAsync(StateHasChanged); };
			snakeGame.updateSnakeTimer = App.CreateTimer(() => {
				snakeGame.UpdateSnake();
				snakeGame.UpdateRender();
			}, Math.Min(210, Math.Max(1, (int)(210 + ((float)(60 - 210) / (150 - 30)) * (snakeArraySize - 30)))));
			snakeGame.PlaceFoodError = (int returnVal) => {
				if (returnVal == 1) {
					NavigationManager?.NavigateTo(NavigationManager.Uri, true);
				}
			};
			snakeGame.UpdateSnake();
			snakeGame.UpdateRender();
		}
	}
}