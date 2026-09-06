import type { Metadata } from "next";
import Button from "@/components/shared/Button";

export const metadata: Metadata = {
  title: "我们的初心 — 千殊教育",
  description: "千殊教育桥梁计划创始团队的初心与使命。",
};

export default function OriginPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* 信笺样式：无背景板，单独展开如一封信 */}
        <div className="bg-white/85 border border-white rounded-xl shadow-glass-lg p-8 md:p-14">
          <article className="font-zhuokai text-bridge-text leading-loose space-y-5 text-base md:text-lg">
            <h1 className="text-2xl md:text-3xl font-bold text-bridge-blue text-center mb-8">我们是谁？</h1>

            <p>我们是一群初心行迹的行者，抱着使命而来。</p>

            <p>
              我们曾经见证许多选择科技专业的理科生，因为种种原因没有机会真正了解自己和这个专业，导致许多家庭不愿见到的境遇发生：家庭千辛万苦供孩子寒窗苦读，结果孩子上大学后
            </p>
            <ul className="list-disc pl-6 space-y-2 text-bridge-muted">
              <li>根本学不会专业课程，想转专业又转不了，毕业难就业，家庭白白培养四年；</li>
              <li>根本不了解这个专业，孩子入到天坑专业，毕业即失业，家庭四年培养打水漂；</li>
              <li>完全不喜欢，孩子学着痛苦难受，最后又被迫退学耗费1年重新复读。</li>
            </ul>

            <p>每一个学生的未来都值得被重视，每一个家庭的希望都值得被珍惜。</p>

            <p>
              因此，我们毅然决然选择开启&ldquo;桥梁计划&rdquo;这个项目，帮助千万学子找到梦想专业，赋能千万家庭长效发展，让孩子乘上科技时代的风口——
            </p>

            <p>
              我们是千殊教育，一群985理工硕博生组成的团队。我们致力于帮助千万学子逃离被信息差宰割的命运，帮助你们在当今的信息时代找到梦想专业、主动乘上科技发展的时代潮流，成就国家高新科技人才！
            </p>

            <h2 className="text-xl font-bold text-bridge-blue pt-4">我们承诺：</h2>
            <ul className="list-disc pl-6 space-y-2 text-bridge-muted">
              <li>所有的咨询信息都来自一线的高校、研究所、大厂、科技公司的真实岗位经验，绝对真实。</li>
              <li>所有讲师学长都来自全国各985高校或国外同等水平高校，资历专业可查验！</li>
              <li>所有产品和服务都流程化、透明化、信息化，做到真正专业高效、公开透明、服务后可溯源！</li>
            </ul>

            <p className="text-right text-bridge-muted pt-6">——千殊团队</p>
          </article>

          <div className="mt-10 text-center">
            <Button href="/" variant="secondary">
              返回首页
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
