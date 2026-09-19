// An Echo Show 8 on a counter: fabric bezel, 16:10 screen, the counter's shadow underneath.
const Device = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 lg:py-16">
    <figure aria-label="Echo Show" className="bezel w-full max-w-[1120px] rounded-[36px] p-3 sm:p-4 lg:p-5">
      <div className="wallpaper relative flex aspect-[16/10] w-full flex-col overflow-hidden rounded-[24px] shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)]">
        {children}
      </div>
    </figure>
    <div className="counter mt-1 h-16 w-[min(100%,1180px)] rounded-b-[40px]" aria-hidden />
  </div>
);

export default Device;
