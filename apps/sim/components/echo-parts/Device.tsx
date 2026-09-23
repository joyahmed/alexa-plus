// An Echo Show 8 on a counter: fabric bezel, 16:10 screen, a soft shadow pooled beneath it.
// Below `sm` the 16:10 sliver is ~224px tall and the composer lands on the content, so the
// screen takes a real height there instead and only becomes 16:10 once there is room for it.
const Device = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col items-center justify-center px-3 pb-10 pt-24 sm:px-4 sm:py-10 lg:py-16">
    <figure aria-label="Echo Show" className="bezel w-full max-w-[1120px] rounded-[36px] p-3 sm:p-4 lg:p-5">
      <div className="wallpaper relative flex h-[64svh] min-h-[440px] w-full flex-col overflow-hidden rounded-[24px] sm:h-auto sm:min-h-0 sm:aspect-[16/10] shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)]">
        {children}
      </div>
    </figure>
    <div className="counter -mt-2 h-10 w-[min(92%,1040px)] rounded-[100%]" aria-hidden />
  </div>
);

export default Device;
