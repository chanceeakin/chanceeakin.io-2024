import { useTrail, animated } from "react-spring";

export const EntryTrailAnimation = ({
  items,
}: {
  items: React.ReactNode[];
}) => {
  const trails = useTrail(items.length, {
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  return (
    <>
      {trails.map((props, i) => (
        <animated.div key={i} style={props}>
          {items[i]}
        </animated.div>
      ))}
    </>
  );
};
