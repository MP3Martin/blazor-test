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

		public class SnakeGame {
			[Inject]
			public IJSRuntime? JSRuntime { get; set; }

			private static Coords gameSize = new Coords(0, 0);
			public enum SnakeData {
				Air = 0, Snake = 1, SnakeHead = 2, Food = 3
			};
			public record struct Coords(int x, int y);

			public SnakeGame(Coords? aGameSize = null) {
				gameSize = (aGameSize == null) ? (new Coords(snakeArraySize, snakeArraySize)) : ((Coords)aGameSize);
				snakeArray = new SnakeData[gameSize.x, gameSize.y];
				try {
					int initialSnakeSize = Math.Max(1, (int)(gameSize.y * 0.2));
					for (int i = 0; i < initialSnakeSize; i++) {
						snakeCoordsList.Add((new Coords(gameSize.x / 2, (int)(gameSize.y / 1.5) - i), (i == initialSnakeSize - 1) ? SnakeData.SnakeHead : SnakeData.Snake));
					}
				} catch (Exception) { }
				CreateFood();
			}
			public SnakeData[,] snakeArray = new SnakeData[gameSize.x, gameSize.y];
			// ((snakeX, snakeY), data)
			private List<(Coords coords, SnakeData data)> snakeCoordsList = new();
			public char lastKey = 'w';
			private void CreateFood(int attempts = 1) {
				(int, int) FindPosSlow() {
					for (int j = 0; j < snakeArray.GetLength(1); j++) {
						for (int i = 0; i < snakeArray.GetLength(0); i++) {
							if (!snakeCoordsList.Where(x => x.coords == new Coords(i, j)).Any()) {
								return (i, j);
							}
						}
					}
					return (0, 0);
				}

				// find random pos
				int randX = new Random().Next(0, gameSize.x);
				int randY = new Random().Next(0, gameSize.y);

				if (attempts > (Math.Max(gameSize.x, gameSize.y) * 7)) {
					PlaceFoodError?.Invoke(1);
					return;
				} else if (attempts > Math.Max(gameSize.x, gameSize.y) * 2) {
					// slow method to place food if too many attempts
					(randX, randY) = FindPosSlow();
				}

				// check if the random pos is empty, recursively retry if not
				if (!snakeCoordsList.Where(x => x.coords == new Coords(randX, randY)).Any()) {
					snakeCoordsList.Add((new Coords(randX, randY), SnakeData.Food));
					UpdateRender();
				} else {
					CreateFood(attempts + 1);
				}
			}

			private string HandleHit(Coords coords) {
				SnakeData coordData = snakeCoordsList.Where(x => x.coords == coords).First().data;
				string strOut = "";
				if (coordData == SnakeData.Food) strOut += "eatFood,";
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
				var prevHeadCoords = snakeCoordsList.Where(x => x.data == SnakeData.SnakeHead).First().coords;

				// calculate new head coords
				var directions = new Dictionary<char, Coords> {
					{ 'w', new Coords(0, -1)},
					{ 'a', new Coords(-1, 0)},
					{ 's', new Coords(0, 1)},
					{ 'd', new Coords(1, 0)}
				};
				var direction = directions[lastKey];
				var newCoords = new Coords(prevHeadCoords.x + direction.x, prevHeadCoords.y + direction.y);
				if (newCoords.x >= gameSize.x) {
					newCoords.x = 0;
				} else if (newCoords.y >= gameSize.y) {
					newCoords.y = 0;
				} else if (newCoords.x < 0) {
					newCoords.x = gameSize.x - 1;
				} else if (newCoords.y < 0) {
					newCoords.y = gameSize.y - 1;
				}

				string hitDataOutput = "";
				if (snakeCoordsList.Where(x => x.coords == newCoords).Any())
					hitDataOutput = HandleHit(newCoords);


				// replace old head with snake
				snakeCoordsList.Remove((prevHeadCoords, SnakeData.SnakeHead));
				snakeCoordsList.Add((prevHeadCoords, SnakeData.Snake));
				// remove last snake bit (only if snake didn't eat food)
				if (!hitDataOutput.Contains("eatFood"))
					snakeCoordsList.Remove(snakeCoordsList.Where(x => x.data == SnakeData.Snake).First());

				// add the new head
				snakeCoordsList.Add((newCoords, SnakeData.SnakeHead));

				if (hitDataOutput.Contains("eatFood")) {
					snakeCoordsList.RemoveAll(x => x.data == SnakeData.Food);
					CreateFood();
				}

				// update the snakeArray with snakeCoordsList
				snakeArray = new SnakeData[gameSize.x, gameSize.y];
				foreach (var item in snakeCoordsList) {
					// rendering order from most to least important
					snakeArray[item.coords.x, item.coords.y] = item.data;
				}
			}
			public System.Timers.Timer updateSnakeTimer = new();
			public Action<int>? PlaceFoodError;
		}

		private SnakeGame snakeGame = new();
		private void OnPageLoad(dynamic pageLoadData) {
			if (pageLoadData.size != null) {
				snakeArraySize = pageLoadData.size;
			}

			snakeGame = new SnakeGame(new SnakeGame.Coords(snakeArraySize, snakeArraySize));
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