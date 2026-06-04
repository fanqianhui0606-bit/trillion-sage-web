import Button from "@/components/shared/Button";

export default function CTASection() {
  return (
    <section className="py-24 px-6 bg-bridge-text text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-white">
        携手共建学术桥梁
      </h2>
      <p className="mt-4 text-white/60 max-w-xl mx-auto leading-relaxed">
        无论你是想了解自己的数理天赋，还是寻找专业的学术规划，
        我们都在这里等你。
      </p>
      <div className="flex justify-center gap-4 mt-8">
        <Button href="/quiz" variant="accent">
          开始测评
        </Button>
        <Button href="/contact" variant="secondary">
          联系我们
        </Button>
      </div>
    </section>
  );
}
