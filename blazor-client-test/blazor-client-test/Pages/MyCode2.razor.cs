using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace blazor_client_test.Pages {
	public partial class MyCode2 {
		[Inject]
		public IJSRuntime? JSRuntime { get; set; }
		private string textOut = "";
		private async void update() {
			await JSRuntime.InvokeVoidAsync("console.log", "lol");
			textOut = "";
			int size = 10;
			int[] nums = new int[size];
			Random randomGen = new();
			int min = int.MaxValue;
			int max = int.MinValue;
			for (int i = 0; i < size; i++) {
				nums[i] = randomGen.Next(-10, 10 + 1);
			}
			for (int i = 0; i < size; i++) {
				if (nums[i] < min) {
					min = nums[i];
				}
				if (nums[i] > max) {
					max = nums[i];
				}
			}
			foreach (int num in nums) {
				textOut += (string.Format("{0, 3}", num) + " | ");
			}
			int[] nums2 = new int[size];
			for (int i = 0; i < size; i++) {
				if (nums[i] == min) {
					nums2[i] = max;
				} else if (nums[i] == max) {
					nums2[i] = min;
				} else {
					nums2[i] = nums[i];
				}
			}
			textOut += ("\n\nNové pole:") + "\n";
			foreach (int num in nums2) {
				textOut += (string.Format("{0, 3}", num));
				textOut += (" | ");
			}
		}

	}
}