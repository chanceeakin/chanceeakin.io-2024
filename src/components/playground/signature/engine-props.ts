// What the player hands each engine. The player owns the controls; an engine
// only draws, and says when it has reached the end.
export type EngineProps = {
  playing: boolean;
  run: number; // changes when the animation should start over
  color: string;
  reduced: boolean;
  onFinish: () => void;
};
