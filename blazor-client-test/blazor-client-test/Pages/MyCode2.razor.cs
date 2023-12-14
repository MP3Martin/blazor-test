using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;

namespace blazor_client_test.Pages {
	public partial class MyCode2 {
		[Inject]
		public IJSRuntime? JSRuntime { get; set; }
		private string textOut = "";
		private void changeDirection(KeyboardEventArgs e) {
			string key = e.Key;
			JSRuntime.InvokeVoidAsync("console.log", key);
			JSRuntime.InvokeVoidAsync("clearSnakeControlInput");
		}

		private int[,] snakeArray = new int[30, 30];
		public void start() {
			for (int i = 0; i < snakeArray.GetLength(0); i++) {
				for (int j = 0; j < snakeArray.GetLength(1); j++) {
					snakeArray[i, j] = new Random().Next(0, 1 + 1);
				}
			}

		}
	}
}