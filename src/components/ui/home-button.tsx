import SaveSvg from 'assets/icons/Save.svg?react';

export default function HomeButton({ onClick }) {
  return (
    <button
      className="z-50 p-1 text-black bg-primary hover:bg-primary-hover  rounded-lg flex justify-center items-center w-7 h-7 fixed bottom-1 left-1"
      onClick={onClick}
    >
      <SaveSvg  className="w-7 h-7" />
    </button>
  );
}
