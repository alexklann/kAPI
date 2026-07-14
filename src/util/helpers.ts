/// Returns true if the trimmed content length
/// of the input string is greater than zero.
export function stringEmpty(input: string): boolean {
  return input.trim().length == 0;
}
