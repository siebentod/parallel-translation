import SaveSvg from 'assets/icons/Save.svg?react';

export default function HomeButton({ onClick }) {
  return (
    <button
      className="z-50 p-1 text-black bg-primary hover:bg-primary-hover  rounded-lg flex justify-center items-center w-7 h-7 fixed top-1 right-1 sm:top-[unset] sm:bottom-3 sm:left-3 lg:top-2 lg:left-2 lg:bottom-[unset]"
      onClick={onClick}
    >
      <SaveSvg  className="w-7 h-7" />
    </button>
  );
}
