export default function PrivacyModalContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-[16px] font-black tracking-[-0.02em]">
        Privacy. By design.
      </h2>

      <p className="text-[14px] leading-relaxed text-zinc-700 dark:text-white/80">
        Your data is analysed securely and discarded immediately.
        We do not store uploads, pasted data, results, or derived insights.
      </p>

      <ul className="space-y-2 text-[13px] text-zinc-600 dark:text-white/70">
        <li>• Files are processed in memory only</li>
        <li>• No databases. No retention</li>
        <li>• No training on user data</li>
        <li>• No resale. Ever</li>
      </ul>

      <p className="text-[12px] text-zinc-500 dark:text-white/50">
        When the page closes, the data is gone.
      </p>
    </div>
  );
}
