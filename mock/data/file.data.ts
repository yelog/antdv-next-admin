import type { SysFile } from '@/types/file'

const exts = ['jpg', 'png', 'pdf', 'docx', 'xlsx', 'zip', 'mp4', 'txt', 'pptx', 'svg']
const mimeMap: Record<string, string> = {
  jpg: 'image/jpeg', png: 'image/png', pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip', mp4: 'video/mp4', txt: 'text/plain',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  svg: 'image/svg+xml'
}
const storages: SysFile['storage'][] = ['local', 'oss', 'cos']
const uploaders = ['admin', 'zhangsan', 'lisi', 'wangwu']
const fileNames: Record<string, string[]> = {
  jpg: ['产品封面图', '用户头像', '活动海报', '团队合照', '办公环境'],
  png: ['系统Logo', '二维码', '图标素材', '截图', '水印模板'],
  pdf: ['用户手册', '合同模板', '年度报告', '技术文档', '发票'],
  docx: ['需求文档', '会议纪要', '工作总结', '项目方案', '操作指南'],
  xlsx: ['员工花名册', '财务报表', '数据统计', '考勤记录', '库存清单'],
  zip: ['项目源码', '资源包', '备份文件', '部署包', '日志归档'],
  mp4: ['产品演示', '培训视频', '操作教程', '宣传片', '会议录像'],
  txt: ['配置说明', '更新日志', '临时笔记', '导入模板', '错误日志'],
  pptx: ['季度汇报', '产品介绍', '培训课件', '方案演示', '年终总结'],
  svg: ['图标文件', '流程图', '架构图', '组织结构图', '数据图表']
}

function randomDate(start: string, end: string) {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  const d = new Date(s + Math.random() * (e - s))
  return d.toISOString().replace('T', ' ').slice(0, 19)
}

function randomSize(ext: string): number {
  const ranges: Record<string, [number, number]> = {
    jpg: [50_000, 5_000_000], png: [20_000, 3_000_000], pdf: [100_000, 20_000_000],
    docx: [30_000, 10_000_000], xlsx: [20_000, 15_000_000], zip: [500_000, 100_000_000],
    mp4: [5_000_000, 500_000_000], txt: [100, 500_000], pptx: [200_000, 50_000_000],
    svg: [1_000, 200_000]
  }
  const [min, max] = ranges[ext] || [1000, 1_000_000]
  return Math.floor(min + Math.random() * (max - min))
}

export const sysFiles: SysFile[] = []

let id = 1
for (const ext of exts) {
  const names = fileNames[ext]
  for (const name of names) {
    const storage = storages[Math.floor(Math.random() * storages.length)]
    const originalName = `${name}.${ext}`
    sysFiles.push({
      id: String(id++),
      name: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`,
      originalName,
      path: `/uploads/${ext}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`,
      size: randomSize(ext),
      mimeType: mimeMap[ext] || 'application/octet-stream',
      ext,
      storage,
      uploader: uploaders[Math.floor(Math.random() * uploaders.length)],
      remark: '',
      createTime: randomDate('2024-01-01', '2024-12-31')
    })
  }
}

sysFiles.sort((a, b) => b.createTime.localeCompare(a.createTime))
