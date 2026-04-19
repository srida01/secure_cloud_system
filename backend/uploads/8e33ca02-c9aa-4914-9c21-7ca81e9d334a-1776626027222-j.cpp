#include <iostream>
using namespace std;

void reverse(int s, int e, int *arr)
{
    if (s < e)
    {
        swap(arr[s], arr[e]);
        reverse(s + 1, e - 1, arr);
    }
}
int main()
{
    int a[5] = {1, 2, 3, 4, 5};
    for (int i = 0; i < 5; i++)
    {
        cout << a[i] << " ";
    }
    reverse(0, 4, a);
    for (int i = 0; i < 5; i++)
    {
        cout << a[i] << " ";
    }
}
