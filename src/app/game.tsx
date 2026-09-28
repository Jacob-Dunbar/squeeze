import { useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const SPRITE_SHEET = require("../../assets/game/character/battle-idle.png");

const KICK_SPRITE_SHEET = require("../../assets/game/character/kick.png");

// Sprite dimensions
const FRAME_WIDTH = 65;
const FRAME_HEIGHT = 65;

const SCALE = 3;

// Actual character size in the original pixel-art scale
const CHARACTER_WIDTH = 40;
const CHARACTER_HEIGHT = 40;

// Sprite frame size on screen
const DISPLAY_WIDTH = FRAME_WIDTH * SCALE;
const DISPLAY_HEIGHT = FRAME_HEIGHT * SCALE;

// Actual character size on screen
const CHARACTER_DISPLAY_WIDTH = CHARACTER_WIDTH * SCALE;
const CHARACTER_DISPLAY_HEIGHT = CHARACTER_HEIGHT * SCALE;

// Sprite sheet layout
const SHEET_COLUMNS = 3;
const TOTAL_FRAMES = 7;

const KICK_FRAMES = 6;

// Movement
const MOVE_SPEED = 4;

const GRAVITY = 0.7;
const JUMP_FORCE = 13;
const FLOOR_BOTTOM = 12;

export default function GameScreen() {
  const [frame, setFrame] = useState(0);
  const [characterX, setCharacterX] = useState(100);
  const [characterY, setCharacterY] = useState(0);
  const [facingRight, setFacingRight] = useState(true);
  const [isKicking, setIsKicking] = useState(false);
  const [kickFrame, setKickFrame] = useState(0);

  const gameWidth = useRef(500);

  const velocityY = useRef(0);
  const isGrounded = useRef(true);

  // Keep track of which directions are currently held
  const keys = useRef({
    left: false,
    right: false,
  });

  // --------------------------------
  // IDLE ANIMATION
  // --------------------------------

  useEffect(() => {
    const animation = setInterval(() => {
      setFrame((current) => (current + 1) % TOTAL_FRAMES);
    }, 100);

    return () => clearInterval(animation);
  }, []);

  // --------------------------------
  // JUMP
  // --------------------------------

  const jump = () => {
    if (!isGrounded.current) return;

    velocityY.current = JUMP_FORCE;
    isGrounded.current = false;
  };

  // --------------------------------
  // CONTINUOUS MOVEMENT
  // --------------------------------

  useEffect(() => {
    let animationFrame: number;

    const updateMovement = () => {
      setCharacterX((current) => {
        let next = current;

        if (keys.current.left) {
          next -= MOVE_SPEED;
          setFacingRight(false);
        }

        if (keys.current.right) {
          next += MOVE_SPEED;
          setFacingRight(true);
        }

        next = Math.max(0, Math.min(gameWidth.current, next));

        return next;
      });

      // Gravity
      setCharacterY((current) => {
        let next = current + velocityY.current;

        velocityY.current -= GRAVITY;

        // Hit the floor
        if (next <= 0) {
          next = 0;
          velocityY.current = 0;
          isGrounded.current = true;
        }

        return next;
      });

      animationFrame = requestAnimationFrame(updateMovement);
    };

    animationFrame = requestAnimationFrame(updateMovement);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // --------------------------------
  // KEYBOARD CONTROLS
  // --------------------------------

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        keys.current.left = true;
      }

      if (event.key === "ArrowRight") {
        keys.current.right = true;
      }

      if (event.key === " ") {
        jump();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        keys.current.left = false;
      }

      if (event.key === "ArrowRight") {
        keys.current.right = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // --------------------------------
  // TOUCH CONTROLS
  // --------------------------------

  const startMovingLeft = () => {
    keys.current.left = true;
  };

  const stopMovingLeft = () => {
    keys.current.left = false;
  };

  const startMovingRight = () => {
    keys.current.right = true;
  };

  const stopMovingRight = () => {
    keys.current.right = false;
  };

  // --------------------------------
  // SPRITE SHEET POSITION
  // --------------------------------

  const column = frame % SHEET_COLUMNS;
  const row = Math.floor(frame / SHEET_COLUMNS);

  // --------------------------------
  // Kick animation
  // --------------------------------

  const kick = () => {
    if (isKicking) return;

    setIsKicking(true);
    setKickFrame(0);
  };

  useEffect(() => {
    if (!isKicking) return;

    const animation = setInterval(() => {
      setKickFrame((current) => {
        if (current >= KICK_FRAMES - 1) {
          setIsKicking(false);
          return 0;
        }

        return current + 1;
      });
    }, 100);

    return () => clearInterval(animation);
  }, [isKicking]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>SQUEEZE // Battle Ground</Text>

      {/* GAME AREA */}

      <View
        style={styles.gameArea}
        onLayout={(event) => {
          gameWidth.current = event.nativeEvent.layout.width;
        }}
      >
        {/* FLOOR */}

        <View style={styles.floor} />

        {/* CHARACTER */}

        <View
          style={[
            styles.characterContainer,
            {
              left: characterX,
              bottom: FLOOR_BOTTOM + characterY,
            },
          ]}
        >
          <View
            style={[
              styles.spriteViewport,
              {
                transform: [{ scaleX: facingRight ? 1 : -1 }],
              },
            ]}
          >
            <Image
              source={isKicking ? KICK_SPRITE_SHEET : SPRITE_SHEET}
              style={[
                styles.spriteSheet,
                {
                  left: isKicking
                    ? -(kickFrame % SHEET_COLUMNS) * DISPLAY_WIDTH
                    : -column * DISPLAY_WIDTH,

                  top: isKicking
                    ? -Math.floor(kickFrame / SHEET_COLUMNS) * DISPLAY_HEIGHT
                    : -row * DISPLAY_HEIGHT,
                },

                Platform.OS === "web"
                  ? ({ imageRendering: "pixelated" } as any)
                  : {},
              ]}
              resizeMode="stretch"
            />
          </View>
        </View>
      </View>

      {/* CONTROLS */}

      <View style={styles.controls}>
        <Pressable
          style={styles.button}
          onPressIn={startMovingLeft}
          onPressOut={stopMovingLeft}
        >
          <Text style={styles.buttonText}>◀</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={jump}>
          <Text style={styles.buttonText}>▲</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={kick}>
          <Text style={styles.buttonText}>KICK</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPressIn={startMovingRight}
          onPressOut={stopMovingRight}
        >
          <Text style={styles.buttonText}>▶</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
  },

  gameArea: {
    flex: 1,
    minHeight: 500,
    backgroundColor: "#222",
    borderWidth: 2,
    borderColor: "#555",
    overflow: "hidden",
    position: "relative",
  },

  floor: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 12,
    backgroundColor: "#777",
  },

  characterContainer: {
    position: "absolute",
    width: DISPLAY_WIDTH,
    height: DISPLAY_HEIGHT,
    overflow: "hidden",
    marginLeft: -DISPLAY_WIDTH / 2,
  },

  spriteSheet: {
    position: "absolute",
    width: DISPLAY_WIDTH * 3,
    height: DISPLAY_HEIGHT * 3,
  },

  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingTop: 20,
  },

  button: {
    width: 80,
    height: 60,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#888",
  },

  buttonText: {
    color: "#111",
    fontSize: 28,
    fontWeight: "bold",
  },

  spriteViewport: {
    width: DISPLAY_WIDTH,
    height: DISPLAY_HEIGHT,
    overflow: "hidden",
  },
});
