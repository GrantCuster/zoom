import { atom, useAtom } from "jotai";
import SlothImage from "./assets/sloth.png";
import { useEffect } from "react";

function App() {
  return (
    <div className="w-full h-[100dvh] relative overflow-hidden bg-neutral-800 flex flex-col">
      <div className="flex-grow">
        <Zoom />
      </div>
      <div className="relative">
        <Readout />
      </div>
    </div>
  );
}

export default App;

function Zoom() {
  const [canvas, setCanvas] = useAtom(CanvasAtom);
  const [camera, setCamera] = useAtom(CameraAtom);
  const [zoomContainer, setZoomContainer] = useAtom(ZoomContainerAtom);

  useEffect(() => {
    async function main() {
      if (canvas) {
        const image = await loadImage(SlothImage);
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(image, 0, 0);
      }
    }
    main();
  }, [canvas]);

  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      if (zoomContainer) {
        event.preventDefault();

        const { clientX: x, clientY: y, deltaX, deltaY, ctrlKey } = event;

        if (ctrlKey) {
          setCamera((camera) =>
            zoomCamera(camera, { x, y }, deltaY / 400, zoomContainer),
          );
        } else {
          if (event.shiftKey) {
            setCamera((camera) => panCamera(camera, deltaY, 0));
          } else {
            setCamera((camera) => panCamera(camera, deltaX, deltaY));
          }
        }
      }
    }
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [zoomContainer, setCamera]);

  return (
    <div
      ref={(div) => {
        if (div) {
          setZoomContainer(div);
        }
      }}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "100%",
        height: "100%",
        transformOrigin: "0 0",
        transform: `scale(${camera.z}) translate(-50%, -50%) translate(${camera.x}px, ${camera.y}px)`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <canvas
        ref={(canvas) => {
          if (canvas) {
            setCanvas(canvas);
          }
        }}
      />
    </div>
  );
}

function Readout() {
  const [camera] = useAtom(CameraAtom);

  return (
    <div className="">
      {`x: ${camera.x.toFixed(2)}, y: ${camera.y.toFixed(2)}, z: ${camera.z.toFixed(2)}`}
    </div>
  );
}

export function screenToCanvas(
  point: Point,
  camera: Camera,
  container: HTMLDivElement,
) {
  const x = (point.x - container.clientWidth / 2) / camera.z - camera.x;
  const y = (point.y - container.clientHeight / 2) / camera.z - camera.y;
  return { x, y };
}

export function canvasToScreen(
  point: Point,
  camera: Camera,
  container: HTMLDivElement,
) {
  const x = (point.x + camera.x) * camera.z + container.clientWidth / 2;
  const y = (point.y + camera.y) * camera.z + container.clientHeight / 2;
  return { x, y };
}

export function panCamera(camera: Camera, dx: number, dy: number): Camera {
  return {
    x: camera.x - dx / camera.z,
    y: camera.y - dy / camera.z,
    z: camera.z,
  };
}

export function zoomCamera(
  camera: Camera,
  point: Point,
  dz: number,
  container: HTMLDivElement,
): Camera {
  const zoom = camera.z - dz * camera.z;

  const p1 = screenToCanvas(point, camera, container);

  const p2 = screenToCanvas(point, { ...camera, z: zoom }, container);

  return {
    x: camera.x + p2.x - p1.x,
    y: camera.y + p2.y - p1.y,
    z: zoom,
  };
}

export type Point = {
  x: number;
  y: number;
};

export type Camera = {
  x: number;
  y: number;
  z: number;
};

export const CanvasAtom = atom<HTMLCanvasElement | null>(null);

export const CameraAtom = atom({
  x: 0,
  y: 0,
  z: 1,
});

export const ZoomContainerAtom = atom<HTMLDivElement | null>(null);

// load image as promise
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};
