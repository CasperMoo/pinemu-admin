#!/bin/bash

# 本地CI测试脚本
# 模拟GitHub Actions的构建过程

set -e

echo "🚀 开始本地CI测试..."

# 检查当前目录结构
echo "📁 当前目录结构:"
pwd
ls -la

# 检查必要文件
echo "✅ 检查必要文件..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json 不存在"
    exit 1
fi

if [ ! -f "pnpm-lock.yaml" ]; then
    echo "❌ pnpm-lock.yaml 不存在"
    exit 1
fi

echo "✅ 必要文件都存在"

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm 未安装"
    exit 1
fi

echo "✅ pnpm 已安装: $(pnpm --version)"

# 模拟GitHub Actions步骤
echo "🔄 Step 1: Setup Node (模拟)"
node --version
npm --version

echo "🔄 Step 2: Setup pnpm (模拟)"
pnpm --version

echo "🔄 Step 3: Install dependencies"
pnpm install

echo "🔄 Step 4: Build project"
pnpm build

echo "✅ 本地CI测试完成!"
echo "🎉 所有步骤都成功执行"

# 检查构建产物
if [ -d "dist" ]; then
    echo "📦 构建产物:"
    ls -la dist/
else
    echo "❌ 构建失败: dist 目录不存在"
    exit 1
fi