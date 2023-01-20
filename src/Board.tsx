import { useMemo, useReducer } from "react";

import style from "./Board.module.css";

const shuffle = <T,>(array: T[]): T[] =>
  [...array].sort(() => Math.random() - 0.5);

enum Color {
  RED = "#f00",
  YELLOW = "#ff0",
  GREEN = "#0f0",
  CYAN = "#0ff",
  BLUE = "#00f",
  MAGENTA = "#f0f",
  TRANSPARENT = "rgba(0, 0, 0, 0)",
}

type BlockData = {
  id: number;
  x: number;
  y: number;
  color: Color;
};

type BoardData = BlockData[];

const chunkByLength = <T,>(array: T[], length: number): T[][] => {
  if (array.length <= length) {
    return [array];
  }
  const chunk = array.slice(0, length);
  const restOfChunks = chunkByLength(array.slice(length), length);
  return [chunk, ...restOfChunks];
};

const generateBoardData = (): BoardData => {
  const colors: Color[] = [
    Color.RED,
    Color.YELLOW,
    Color.GREEN,
    Color.CYAN,
    Color.BLUE,
    Color.MAGENTA,
  ].flatMap((color) => [color, color, color, color]);

  const coordinates = Array.from({ length: 24 }, (_, i) => ({
    x: i % 5,
    y: Math.floor(i / 5),
  }));
  const shuffledCoordinates = shuffle(coordinates);

  return shuffledCoordinates
    .map(({ x, y }, i) => ({ id: i, x, y, color: colors[i] }))
    .concat({ x: 4, y: 4, color: Color.TRANSPARENT, id: 24 });
};

const generateAssignmentData = (): BoardData => {
  const colors: Color[] = [
    Color.RED,
    Color.YELLOW,
    Color.GREEN,
    Color.CYAN,
    Color.BLUE,
    Color.MAGENTA,
  ].flatMap((color) => [color, color]);

  const coordinates = Array.from({ length: 9 }, (_, i) => ({
    x: i % 3,
    y: Math.floor(i / 3),
  }));

  return shuffle(coordinates)
    .map(({ x, y }, i) => ({ id: i, x, y, color: colors[i] }))
};

const boardDataToString = (boardData: BoardData): string => {
  const colors = boardData.map((block) => {
    switch (block.color) {
      case Color.RED:
        return "r";
      case Color.YELLOW:
        return "y";
      case Color.GREEN:
        return "g";
      case Color.CYAN:
        return "c";
      case Color.BLUE:
        return "b";
      case Color.MAGENTA:
        return "m";
      case Color.TRANSPARENT:
        return "t";
    }
  });

  return chunkByLength(colors, 5)
    .map((row) => row.join(""))
    .join("\n");
};

export const Board = () => {
  const boardData = useMemo(generateBoardData, []);
  const [ignore, forceUpdate] = useReducer((x) => x + 1, 0);
  const transparentBlock = boardData.find(
    (block) => block.color === Color.TRANSPARENT
  );

  if (!transparentBlock) {
    return null;
  }

  const isNextToTransparent = (x: number, y: number): boolean => {
    const { x: tx, y: ty } = transparentBlock;
    return (
      (x + 1 === tx && y === ty) ||
      (x - 1 === tx && y === ty) ||
      (y + 1 === ty && x === tx) ||
      (y - 1 === ty && x === tx)
    );
  };

  const moveBlock = (block: BlockData): void => {
    [block.x, transparentBlock.x] = [transparentBlock.x, block.x];
    [block.y, transparentBlock.y] = [transparentBlock.y, block.y];
    forceUpdate();
  };

  return (
    <div className={style.board}>
      {boardData.map((block) => (
        <button
          key={block.id}
          className={style.block}
          style={{
            left: block.x * 64,
            top: block.y * 64,
            backgroundColor: block.color,
          }}
          onClick={() => moveBlock(block)}
          disabled={!isNextToTransparent(block.x, block.y)}
          data-is-transparent={block.id === transparentBlock.id}
        />
      ))}
    </div>
  );
};
