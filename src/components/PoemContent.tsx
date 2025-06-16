
interface PoemContentProps {
  content: string;
}

const PoemContent = ({ content }: PoemContentProps) => {
  return (
    <div className="prose prose-lg max-w-none font-serif text-gray-800 whitespace-pre-wrap">
      {content}
    </div>
  );
};

export default PoemContent;
