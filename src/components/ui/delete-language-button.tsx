import BinSvg from 'assets/icons/Bin.svg?react';

export default function DeleteLanguageButton({ onClick }) {
  return (
    <button
      className="z-50 p-1 text-black bg-primary hover:bg-primary-hover rounded-lg flex justify-center items-center w-7 h-7 fixed bottom-1 right-1"
      onClick={onClick}
    >
      <BinSvg  className="w-7 h-7" />
    </button>
  );
}
