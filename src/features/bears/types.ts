export interface Bear {
  // Stable identifier, used as React key and as route parameter.
  id: string;
  name: string;
  binomial: string;
  image: string | null;
  range: string;
}
