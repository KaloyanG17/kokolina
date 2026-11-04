import { StitchLoader } from "@/components/stitch-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 pt-24">
      <div className="denim stitched-lg flex w-full max-w-md flex-col items-center gap-4 rounded-lg p-8">
        <StitchLoader className="w-full" />
        <p className="caption-4 font-mono uppercase tracking-widest text-faded">Stitching the page</p>
      </div>
    </div>
  );
}
