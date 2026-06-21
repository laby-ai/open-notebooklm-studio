'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ChevronRight, PlayCircle,
  Link as LinkIcon, ArrowRight,
  Headphones,
  Presentation,
  ShieldCheck,
  Plus,
  Search,
  Clock3,
  BookOpen,
  Settings,
  CreditCard,
  LogIn,
} from 'lucide-react';
import { AppProvider } from '@/contexts/AppContext';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { LibraryPanel } from '@/components/library/LibraryPanel';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { StudioPanel } from '@/components/studio/StudioPanel';
import { VirtualClassroomWorkspace } from '@/components/studio/VirtualClassroomWorkspace';
import { KnowledgeMapWorkspace } from '@/components/studio/KnowledgeMapWorkspace';
import { LiquidGlassProvider } from '@/components/ui/liquid-glass-provider';
import { useApp } from '@/contexts/AppContext';

// Scroll reveal hook
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

// Reveal animation wrapper
function Reveal({ children, delay = 0, direction = 'up', className = '' }: {
  children: React.ReactNode; delay?: number; direction?: 'up' | 'scale'; className?: string;
}) {
  const { ref, isVisible } = useScrollReveal();
  const base = 'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]';
  const start = direction === 'up' ? 'opacity-0 translate-y-12' : 'opacity-0 scale-95';
  const end = 'opacity-100 translate-y-0 scale-100';
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`${base} ${isVisible ? end : start} ${className}`}>
      {children}
    </div>
  );
}

// Premium button
function PremiumButton({ onClick, children, variant = 'primary', className = '', ariaLabel, testId }: {
  onClick: () => void; children: React.ReactNode; variant?: 'primary' | 'secondary'; className?: string; ariaLabel?: string; testId?: string;
}) {
  const base = 'px-6 py-3 rounded-full font-medium transition-all duration-500 flex items-center justify-center gap-2 cursor-pointer';
  const variants = {
    primary: 'liquid-glass-btn-primary bg-white text-black hover:scale-105',
    secondary: 'liquid-glass-btn text-[var(--text-primary)]',
  };
  return <button onClick={onClick} aria-label={ariaLabel} data-testid={testId} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
}

function PremiumLink({ href, children, variant = 'primary', className = '', ariaLabel, testId }: {
  href: string; children: React.ReactNode; variant?: 'primary' | 'secondary'; className?: string; ariaLabel?: string; testId?: string;
}) {
  const base = 'px-6 py-3 rounded-full font-medium transition-all duration-500 inline-flex items-center justify-center gap-2';
  const variants = {
    primary: 'liquid-glass-btn-primary bg-white text-black hover:scale-105',
    secondary: 'liquid-glass-btn text-[var(--text-primary)]',
  };
  return (
    <a href={href} aria-label={ariaLabel} data-testid={testId} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </a>
  );
}

interface WorkspaceNotebook {
  id: string;
  title: string;
  sourceCount: number;
  updatedAt: string;
  accent: string;
}

type AccountCenterStatus = {
  configured: boolean;
  publicUrl: string | null;
  billingMode: 'not_configured' | 'portal_only' | 'reservation_ready';
  billingReservationReady: boolean;
};

const NOTEBOOKS_STORAGE_KEY = 'lingbi-workspace-notebooks';
const ACTIVE_NOTEBOOK_STORAGE_KEY = 'lingbi-active-workspace-notebook';
const DEFAULT_WORKSPACE_UPDATED_AT = '2026-01-01T00:00:00.000Z';

function createDefaultNotebooks(): WorkspaceNotebook[] {
  return [
    {
      id: 'default-workspace',
      title: '默认资料工作台',
      sourceCount: 0,
      updatedAt: DEFAULT_WORKSPACE_UPDATED_AT,
      accent: 'from-sky-100 to-indigo-100',
    },
  ];
}

function formatNotebookDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '刚刚';
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative ${compact ? 'h-10 w-10' : 'h-16 w-16'} flex-shrink-0 overflow-hidden rounded-[1.05rem] border border-[var(--border-medium)] bg-[var(--bg-card)] shadow-sm`}
    >
      <img
        src="/assets/brand/lingbi-mark.svg"
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function HeroWorkbenchScreenshot() {
  return (
    <div className="liquid-glass-card relative mx-auto w-[min(96vw,1500px)] overflow-hidden rounded-[1.75rem] p-2 ring-1 ring-cyan-300/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_12%,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_82%_72%,rgba(99,102,241,0.16),transparent_30%),linear-gradient(135deg,rgba(5,10,24,0.96),rgba(6,12,28,0.99))]" />
      <div className="relative overflow-hidden rounded-[1.35rem] border border-cyan-100/12 bg-black/35 shadow-[0_28px_90px_rgba(0,0,0,0.36)]">
        <img
          src="/assets/screenshots/lingbi-workbench-real.png"
          alt="灵笔工作室真实工作台截图"
          className="block w-full object-cover"
          loading="eager"
        />
      </div>
    </div>
  );
}

function TraceabilityVisual() {
  return (
    <div className="aspect-square liquid-glass-card rounded-3xl p-7 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.22),transparent_42%),radial-gradient(circle_at_80%_75%,rgba(6,182,212,0.15),transparent_38%)]" />
      <div className="relative h-full rounded-3xl border border-white/10 bg-black/20 p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldCheck className="h-4 w-4 text-cyan-200" />
          答案与来源绑定
        </div>
        <div className="rounded-2xl bg-white/[0.07] p-4 text-sm leading-relaxed text-white/78">
          GLP-1 方案的关键风险集中在长期依从性和停药反弹<sup className="text-cyan-200">[1]</sup>，价格敏感用户更需要阶梯式干预<sup className="text-cyan-200">[2]</sup>。
        </div>
        <div className="mt-4 space-y-3">
          {['[1] PDF 第 12 页: adherence after discontinuation', '[2] 访谈纪要: price-sensitive cohort'].map((item) => (
            <div key={item} className="rounded-xl border-l-2 border-cyan-300 bg-cyan-300/10 px-4 py-3 text-xs text-cyan-100">
              {item}
            </div>
          ))}
        </div>
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-blue-300/20 bg-blue-400/10 p-4">
          <p className="text-xs font-semibold text-blue-100">点击脚注即可回到原文证据</p>
        </div>
      </div>
    </div>
  );
}

function MultimodalVisual() {
  return (
    <div className="aspect-square liquid-glass-card rounded-3xl p-7 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(168,85,247,0.22),transparent_40%),radial-gradient(circle_at_20%_75%,rgba(245,158,11,0.13),transparent_38%)]" />
      <div className="relative h-full rounded-3xl border border-white/10 bg-black/20 p-5">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white">
          <Headphones className="h-4 w-4 text-violet-200" />
          报告、PPT、播客同步产出
        </div>
        <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Presentation className="h-4 w-4 text-amber-200" />
              第 3 页：留存拐点
            </div>
            <span className="text-[11px] text-white/35">00:42</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-28 rounded-xl bg-gradient-to-br from-blue-400/35 to-cyan-400/15" />
            <div className="col-span-2 space-y-2">
              <div className="h-3 w-4/5 rounded bg-white/30" />
              <div className="h-3 w-3/5 rounded bg-white/18" />
              <div className="mt-4 h-14 rounded-xl border border-amber-200/30 bg-amber-200/10" />
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-violet-300/20 bg-violet-300/10 p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-violet-100">
            <span>双人播客讲解</span>
            <span>12:08</span>
          </div>
          <div className="flex items-end gap-1.5">
            {[36, 58, 42, 72, 46, 64, 38, 70, 52, 40, 60, 44].map((h, index) => (
              <div key={index} className="w-full rounded-full bg-violet-200/60" style={{ height: `${h}px` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotebookHome({
  notebooks,
  activeNotebookId,
  accountStatus,
  onCreate,
  onOpen,
  onConfigure,
  onShowLanding,
}: {
  notebooks: WorkspaceNotebook[];
  activeNotebookId: string | null;
  accountStatus: AccountCenterStatus | null;
  onCreate: () => void;
  onOpen: (id: string) => void;
  onConfigure: () => void;
  onShowLanding: () => void;
}) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredNotebooks = notebooks.filter(notebook => notebook.title.toLowerCase().includes(normalizedQuery));

  return (
    <div className="min-h-screen overflow-y-auto bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/88 px-6 py-4 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandMark compact />
            <div>
              <h1 className="text-lg font-semibold tracking-tight">灵笔工作室</h1>
              <p className="text-xs text-[var(--text-tertiary)]">选择或建立一个资料工作台</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {accountStatus?.publicUrl ? (
              <a
                href={accountStatus.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="liquid-glass-btn rounded-full px-4 py-2 text-sm"
                data-testid="notebook-home-account"
              >
                <CreditCard className="h-4 w-4" />
                账号与用量
              </a>
            ) : (
              <span
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--glass-subtle)] px-4 py-2 text-sm text-[var(--text-tertiary)]"
                title="部署后配置账号中心地址即可启用"
              >
                账号与用量未配置
              </span>
            )}
            <button
              type="button"
              onClick={onConfigure}
              className="liquid-glass-btn rounded-full px-4 py-2 text-sm"
              data-testid="notebook-home-configure"
            >
              <Settings className="h-4 w-4" />
              模型设置
            </button>
            <button
              type="button"
              onClick={onCreate}
              className="liquid-glass-btn-primary rounded-full px-5 py-2 text-sm"
              data-testid="notebook-home-create"
            >
              <Plus className="h-4 w-4" />
              新建资料工作台
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-3 text-sm font-medium text-[var(--accent-blue)]">资料工作台</p>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              打开资料，追问证据，把内容整理成可交付产物。
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
              首页只保留开始工作的必要入口：资料工作台、模型配置、账号与用量。上传、问答、知识卡片、语音摘要和课堂产物都在工作台内完成。
            </p>
          </div>
          <div className="grid gap-4">
            <div className="liquid-glass-card rounded-2xl p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="h-4 w-4 text-[var(--accent-blue)]" />
                推荐使用路径
              </div>
              <div className="grid gap-3 text-sm text-[var(--text-secondary)]">
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--glass-subtle)] p-3">1. 新建或打开资料工作台</div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--glass-subtle)] p-3">2. 添加文件、网页、粘贴文本或快速研究来源</div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--glass-subtle)] p-3">3. 在资料对话中提问，并在右侧 Studio 生成产物</div>
              </div>
            </div>
            <div className="liquid-glass-card rounded-2xl p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="h-4 w-4 text-[var(--accent-emerald)]" />
                账号与用量
              </div>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {accountStatus?.billingReservationReady
                  ? '账号中心已具备用量预占和结算配置，可把 AI 调用归集到成员额度。'
                  : accountStatus?.publicUrl
                    ? '账号门户已连接。当前先提供普通入口，后续模型调用会按成员额度接入预占和结算。'
                    : '部署后配置账号中心地址，即可在这里进入账号门户并查看成员额度。'}
              </p>
              {accountStatus?.publicUrl && (
                <a
                  href={accountStatus.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--glass-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-blue)]"
                  data-testid="notebook-home-account-card"
                >
                  打开账号门户
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">最近打开的资料工作台</h3>
            <p className="text-sm text-[var(--text-tertiary)]">每个工作台后续会独立保存来源、对话、笔记和 Studio 产物。</p>
          </div>
          <label className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索资料工作台..."
              className="liquid-glass-input pl-10"
              data-testid="notebook-home-search"
            />
          </label>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <button
            type="button"
            onClick={onCreate}
            className="group flex min-h-[190px] flex-col items-start justify-between rounded-2xl border border-dashed border-[var(--border-primary)] bg-[var(--glass-subtle)] p-6 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--accent-blue)] hover:bg-[var(--glass-active)]"
            data-testid="notebook-home-create-card"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-blue)]/12 text-[var(--accent-blue)]">
              <Plus className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-xl font-semibold">建立新的资料工作台</span>
              <span className="mt-2 block text-sm text-[var(--text-tertiary)]">从上传资料、网页或粘贴文本开始。</span>
            </span>
          </button>

          {filteredNotebooks.map(notebook => (
            <button
              key={notebook.id}
              type="button"
              onClick={() => onOpen(notebook.id)}
              className={`group min-h-[190px] rounded-2xl border p-6 text-left transition-all hover:-translate-y-0.5 ${
                notebook.id === activeNotebookId
                  ? 'border-[var(--accent-blue)] bg-[var(--glass-active)]'
                  : 'border-[var(--border-subtle)] bg-[var(--glass-subtle)] hover:border-[var(--border-primary)]'
              }`}
              data-testid={`notebook-home-card-${notebook.id}`}
            >
              <div className={`mb-8 h-16 w-16 rounded-2xl bg-gradient-to-br ${notebook.accent} shadow-inner`} />
              <div className="mb-4">
                <h4 className="line-clamp-2 text-xl font-semibold tracking-tight">{notebook.title}</h4>
                <p className="mt-2 text-sm text-[var(--text-tertiary)]">{notebook.sourceCount} 个来源</p>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-tertiary)]">
                <span className="flex items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatNotebookDate(notebook.updatedAt)}
                </span>
                <span
                  className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-1 text-[var(--text-secondary)]"
                  data-testid={`notebook-home-open-${notebook.id}`}
                >
                  打开工作台
                </span>
              </div>
            </button>
          ))}
        </section>

        <div className="mt-10">
          <button type="button" onClick={onShowLanding} className="text-sm text-[var(--text-tertiary)] transition hover:text-[var(--text-primary)]">
            查看产品介绍
          </button>
        </div>
      </main>
    </div>
  );
}

// ---- Landing Page ----
function LandingPage({
  accountStatus,
  onOpenNotebookHome,
}: {
  accountStatus: AccountCenterStatus | null;
  onOpenNotebookHome: () => void;
}) {
  const accountUrl = accountStatus?.publicUrl || '/#notebooks';
  const accountCtaText = accountStatus?.publicUrl ? '登录账号' : '进入工作台';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--border-primary)]">
      <nav className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/86 px-6 py-4 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandMark compact />
            <span className="font-semibold text-xl tracking-tight text-[var(--text-primary)]">灵笔工作室</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenNotebookHome}
              className="liquid-glass-btn rounded-full px-4 py-2 text-sm"
              data-testid="nav-open-notebooks"
            >
              资料工作台
            </button>
            <a
              href={accountUrl}
              className="liquid-glass-btn-primary rounded-full px-5 py-2 text-sm"
              data-testid="nav-login-account"
            >
              <LogIn className="h-4 w-4" />
              {accountCtaText}
            </a>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-[calc(100vh-73px)] flex-col justify-between overflow-hidden px-6 pt-20">
        <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--glass-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)]">
              资料理解、证据问答和内容产物工作台
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-[var(--text-primary)] md:text-7xl">
              把资料变成可以追问、引用和交付的工作流。
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
              上传文件、网页或粘贴文本，在资料对话中追问证据，再生成知识卡片、语音摘要、课堂内容和基础演示文稿。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PremiumLink
                href={accountUrl}
                ariaLabel={accountStatus?.publicUrl ? '登录账号并进入应用门户' : '进入资料工作台'}
                testId="hero-login-account"
                className="text-base px-7 py-3.5"
              >
                <LogIn size={18} />
                {accountCtaText}
              </PremiumLink>
              <PremiumButton
                variant="secondary"
                onClick={onOpenNotebookHome}
                ariaLabel="查看资料工作台"
                testId="hero-open-notebooks"
                className="text-base px-7 py-3.5"
              >
                查看资料工作台 <ChevronRight size={18} />
              </PremiumButton>
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 text-sm text-[var(--text-secondary)] sm:grid-cols-3">
              {['来源可追溯', '产物可下载', '用量接账号'].map(item => (
                <div key={item} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--glass-subtle)] px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Reveal direction="scale" delay={120} className="min-w-0">
            <HeroWorkbenchScreenshot />
          </Reveal>
        </div>
        <div className="mx-auto mt-12 grid w-full max-w-7xl gap-4 pb-10 md:grid-cols-3">
          {[
            ['资料对话', '把回答绑定到来源片段，减少无证据结论。'],
            ['Studio 产物', '从同一批资料生成卡片、语音摘要、课堂和简报。'],
            ['账号与用量', accountStatus?.publicUrl ? '登录账号门户查看额度和后续成员用量。' : '配置账号中心后可接入成员额度和计费。'],
          ].map(([title, body]) => (
            <div key={title} className="liquid-glass-card rounded-2xl p-5">
              <h2 className="text-base font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-40 relative border-t border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-32 text-center text-[var(--text-primary)]">
              不止摘要。<br /> <span className="text-[var(--text-tertiary)]">从资料到可发布内容。</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-20 items-center mb-40">
            <Reveal delay={100} className="order-2 md:order-1">
              <h3 className="text-3xl font-semibold mb-6 flex items-center gap-4"><LinkIcon className="text-blue-500" /> 结论可追溯</h3>
              <p className="text-xl text-[var(--text-secondary)] leading-relaxed font-light">
                回答、卡片和产物都尽量带回资料片段。用户可以从结论回到来源，判断这句话是否真的来自上传内容。
              </p>
            </Reveal>
            <Reveal direction="scale" delay={300} className="order-1 md:order-2">
              <TraceabilityVisual />
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 gap-20 items-center mb-40">
            <Reveal direction="scale" delay={100}>
              <MultimodalVisual />
            </Reveal>
            <Reveal delay={300}>
              <h3 className="text-3xl font-semibold mb-6 flex items-center gap-4"><PlayCircle className="text-purple-500" /> 多形态产物</h3>
              <p className="text-xl text-[var(--text-secondary)] leading-relaxed font-light">
                从同一批资料生成语音摘要、知识卡片、虚拟教室内容和基础演示文稿。每个结果都回到工作台内打开、复核和下载。
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 flex flex-col items-center border-t border-[var(--glass-border)]">
        <Reveal>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-center">开始处理你的资料</h2>
          <div className="flex justify-center">
            <PremiumLink href={accountUrl} ariaLabel={accountStatus?.publicUrl ? '登录账号并进入应用门户' : '进入资料工作台'} testId="cta-login-account" className="text-lg py-4 px-10">
              {accountCtaText} <ArrowRight size={20} />
            </PremiumLink>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

// ---- Main App Content ----
function WorkbenchCenterPanel({ openSettingsOnMount }: { openSettingsOnMount?: boolean }) {
  const { virtualClassroomViewer, knowledgeMapViewer } = useApp();
  if (virtualClassroomViewer) return <VirtualClassroomWorkspace />;
  if (knowledgeMapViewer) return <KnowledgeMapWorkspace />;
  return <EditorPanel openSettingsOnMount={openSettingsOnMount} />;
}

function AcademicPresenterContent({
  openSettingsOnMount = false,
  workspaceTitle,
  onBackHome,
  showSourceGuide,
  onSourceGuideDismiss,
}: {
  openSettingsOnMount?: boolean;
  workspaceTitle: string;
  onBackHome: () => void;
  showSourceGuide: boolean;
  onSourceGuideDismiss: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ThreeColumnLayout
        leftPanel={(
          <LibraryPanel
            workspaceTitle={workspaceTitle}
            onBackHome={onBackHome}
            showSourceGuide={showSourceGuide}
            onSourceGuideDismiss={onSourceGuideDismiss}
          />
        )}
        centerPanel={<WorkbenchCenterPanel openSettingsOnMount={openSettingsOnMount} />}
        rightPanel={<StudioPanel />}
        defaultLeftWidth={280}
        defaultRightWidth={380}
        initialMobilePanel={showSourceGuide ? 'left' : 'center'}
      />
    </div>
  );
}

export default function HomePage() {
  const [entered, setEntered] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [openSettingsOnEnter, setOpenSettingsOnEnter] = useState(false);
  const [notebooks, setNotebooks] = useState<WorkspaceNotebook[]>([]);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [showSourceGuide, setShowSourceGuide] = useState(false);
  const [accountStatus, setAccountStatus] = useState<AccountCenterStatus | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(NOTEBOOKS_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) as WorkspaceNotebook[] : null;
      const nextNotebooks = Array.isArray(parsed) && parsed.length > 0 ? parsed : createDefaultNotebooks();
      const savedActive = window.localStorage.getItem(ACTIVE_NOTEBOOK_STORAGE_KEY);
      setNotebooks(nextNotebooks);
      setActiveNotebookId(savedActive && nextNotebooks.some(item => item.id === savedActive) ? savedActive : nextNotebooks[0]?.id || null);
    } catch {
      const defaults = createDefaultNotebooks();
      setNotebooks(defaults);
      setActiveNotebookId(defaults[0]?.id || null);
    }
  }, []);

  useEffect(() => {
    if (notebooks.length === 0) return;
    try {
      window.localStorage.setItem(NOTEBOOKS_STORAGE_KEY, JSON.stringify(notebooks));
      if (activeNotebookId) window.localStorage.setItem(ACTIVE_NOTEBOOK_STORAGE_KEY, activeNotebookId);
    } catch {
      // Ignore localStorage failures in privacy modes.
    }
  }, [activeNotebookId, notebooks]);

  useEffect(() => {
    let cancelled = false;
    async function loadAccountStatus() {
      try {
        const response = await fetch('/api/account/status', { cache: 'no-store' });
        if (!response.ok) return;
        const status = await response.json() as AccountCenterStatus;
        if (!cancelled) setAccountStatus(status);
      } catch {
        if (!cancelled) setAccountStatus(null);
      }
    }
    void loadAccountStatus();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (entered || showLanding) return;
    let cancelled = false;
    async function syncDefaultSourceCount() {
      try {
        const response = await fetch('/api/ingestion/sources', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json() as { sources?: unknown[] };
        const sourceCount = Array.isArray(data.sources) ? data.sources.length : 0;
        if (cancelled || sourceCount <= 0) return;
        setNotebooks(prev => {
          const current = prev.length > 0 ? prev : createDefaultNotebooks();
          return current.map(notebook => (
            notebook.id === 'default-workspace'
              ? { ...notebook, sourceCount }
              : notebook
          ));
        });
      } catch {
        // Keep the notebook home usable even if the source store is unavailable.
      }
    }
    void syncDefaultSourceCount();
    return () => { cancelled = true; };
  }, [entered, showLanding]);

  useEffect(() => {
    const applyRouteState = () => {
      const params = new URLSearchParams(window.location.search);
      const isWorkbenchRoute =
        window.location.hash === '#workbench' ||
        window.location.hash === '#workbench-settings' ||
        params.get('view') === 'workbench';

      if (isWorkbenchRoute) {
        setShowLanding(false);
        setOpenSettingsOnEnter(params.get('settings') === '1' || window.location.hash === '#workbench-settings');
        setEntered(true);
        return;
      }

      if (window.location.hash === '#notebooks' || params.get('view') === 'notebooks') {
        setShowLanding(false);
        setEntered(false);
        return;
      }

      if (params.get('view') === 'landing') {
        setShowLanding(true);
        setEntered(false);
        return;
      }

      if (!window.location.hash && !window.location.search) {
        setShowLanding(true);
        setEntered(false);
      }
    };

    applyRouteState();
    window.addEventListener('hashchange', applyRouteState);
    window.addEventListener('popstate', applyRouteState);
    return () => {
      window.removeEventListener('hashchange', applyRouteState);
      window.removeEventListener('popstate', applyRouteState);
    };
  }, []);

  const enterWorkbench = (openSettings = false, notebookId = activeNotebookId) => {
    if (notebookId) {
      setActiveNotebookId(notebookId);
      setNotebooks(prev => prev.map(notebook => (
        notebook.id === notebookId ? { ...notebook, updatedAt: new Date().toISOString() } : notebook
      )));
    }
    setOpenSettingsOnEnter(openSettings);
    setShowLanding(false);
    setEntered(true);

    const hash = openSettings ? '#workbench-settings' : '#workbench';
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${hash}`);
    }
  };

  const createNotebook = () => {
    const id = `workspace-${Date.now()}`;
    const nextNotebook: WorkspaceNotebook = {
      id,
      title: `资料工作台 ${notebooks.length + 1}`,
      sourceCount: 0,
      updatedAt: new Date().toISOString(),
      accent: ['from-cyan-100 to-blue-100', 'from-violet-100 to-sky-100', 'from-emerald-100 to-teal-100'][notebooks.length % 3],
    };
    setNotebooks(prev => [nextNotebook, ...prev]);
    setShowSourceGuide(true);
    enterWorkbench(false, id);
  };

  const openNotebook = (id: string) => enterWorkbench(false, id);

  const openNotebookHome = () => {
    setEntered(false);
    setShowLanding(false);
    if (window.location.hash !== '#notebooks') {
      window.history.replaceState(null, '', `${window.location.pathname}#notebooks`);
    }
  };

  const backToNotebookHome = () => {
    openNotebookHome();
  };

  const activeNotebook = notebooks.find(notebook => notebook.id === activeNotebookId) || notebooks[0] || createDefaultNotebooks()[0];

  return (
    <AppProvider>
      <LiquidGlassProvider>
        {entered ? (
          <AcademicPresenterContent
            openSettingsOnMount={openSettingsOnEnter}
            workspaceTitle={activeNotebook.title}
            onBackHome={backToNotebookHome}
            showSourceGuide={showSourceGuide}
            onSourceGuideDismiss={() => setShowSourceGuide(false)}
          />
        ) : showLanding ? (
          <LandingPage
            accountStatus={accountStatus}
            onOpenNotebookHome={openNotebookHome}
          />
        ) : (
          <NotebookHome
            notebooks={notebooks.length > 0 ? notebooks : createDefaultNotebooks()}
            activeNotebookId={activeNotebookId}
            accountStatus={accountStatus}
            onCreate={createNotebook}
            onOpen={openNotebook}
            onConfigure={() => enterWorkbench(true)}
            onShowLanding={() => {
              setShowLanding(true);
              window.history.replaceState(null, '', window.location.pathname);
            }}
          />
        )}
      </LiquidGlassProvider>
    </AppProvider>
  );
}
