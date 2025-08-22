import React from 'react';
import Badge from './Badge';

const BadgeDemo = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Soft Pastel Badge Component</h1>
        <p className="text-gray-600 mb-8">8 beautiful badge variants with soft pastel colors - exactly like your image</p>
        
        {/* All 8 Badge Variants - Horizontal Row */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">All Badge Variants</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Badge variant="default">Badge</Badge>
            <Badge variant="red">Badge</Badge>
            <Badge variant="yellow">Badge</Badge>
            <Badge variant="green">Badge</Badge>
            <Badge variant="blue">Badge</Badge>
            <Badge variant="indigo">Badge</Badge>
            <Badge variant="purple">Badge</Badge>
            <Badge variant="pink">Badge</Badge>
          </div>
        </div>

        {/* Color Palette Reference */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Color Palette Reference</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <Badge variant="default">Badge</Badge>
              <p className="text-xs text-gray-500">default</p>
              <p className="text-xs text-gray-400">bg-gray-100 text-gray-800</p>
            </div>
            <div className="text-center space-y-2">
              <Badge variant="red">Badge</Badge>
              <p className="text-xs text-gray-500">red</p>
              <p className="text-xs text-gray-400">bg-red-100 text-red-800</p>
            </div>
            <div className="text-center space-y-2">
              <Badge variant="yellow">Badge</Badge>
              <p className="text-xs text-gray-500">yellow</p>
              <p className="text-xs text-gray-400">bg-yellow-100 text-yellow-800</p>
            </div>
            <div className="text-center space-y-2">
              <Badge variant="green">Badge</Badge>
              <p className="text-xs text-gray-500">green</p>
              <p className="text-xs text-gray-400">bg-green-100 text-green-800</p>
            </div>
            <div className="text-center space-y-2">
              <Badge variant="blue">Badge</Badge>
              <p className="text-xs text-gray-500">blue</p>
              <p className="text-xs text-gray-400">bg-blue-100 text-blue-800</p>
            </div>
            <div className="text-center space-y-2">
              <Badge variant="indigo">Badge</Badge>
              <p className="text-xs text-gray-500">indigo</p>
              <p className="text-xs text-gray-400">bg-indigo-100 text-indigo-800</p>
            </div>
            <div className="text-center space-y-2">
              <Badge variant="purple">Badge</Badge>
              <p className="text-xs text-gray-500">purple</p>
              <p className="text-xs text-gray-400">bg-purple-100 text-purple-800</p>
            </div>
            <div className="text-center space-y-2">
              <Badge variant="pink">Badge</Badge>
              <p className="text-xs text-gray-500">pink</p>
              <p className="text-xs text-gray-400">bg-pink-100 text-pink-800</p>
            </div>
          </div>
        </div>

        {/* Practical Examples */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Practical Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-800 mb-4">Status Indicators</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="green">Active</Badge>
                  <span className="text-sm text-gray-600">User is online</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="yellow">Pending</Badge>
                  <span className="text-sm text-gray-600">Awaiting approval</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="red">Error</Badge>
                  <span className="text-sm text-gray-600">Connection failed</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-800 mb-4">Category Tags</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="blue">Technology</Badge>
                <Badge variant="purple">Design</Badge>
                <Badge variant="green">Business</Badge>
                <Badge variant="pink">Creative</Badge>
                <Badge variant="indigo">Development</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Usage Examples</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-800 mb-4">Code Examples</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Basic Badge:</p>
                <code className="block bg-gray-100 p-3 rounded text-sm font-mono">
                  {`<Badge>Badge</Badge>`}
                </code>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">With Color Variant:</p>
                <code className="block bg-gray-100 p-3 rounded text-sm font-mono">
                  {`<Badge variant="blue">Blue Badge</Badge>`}
                </code>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Custom Styling:</p>
                <code className="block bg-gray-100 p-3 rounded text-sm font-mono">
                  {`<Badge className="bg-orange-100 text-orange-800">Custom</Badge>`}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Design Features */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Design Features</h2>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-4">What Makes These Badges Special</h3>
            <div className="space-y-3 text-sm text-blue-700">
              <p>• <strong>Soft Pastel Colors</strong>: All variants use -100 background colors for gentle appearance</p>
              <p>• <strong>Perfect Contrast</strong>: -800 text colors ensure excellent readability</p>
              <p>• <strong>Pill Shape</strong>: rounded-full creates the perfect pill-shaped design</p>
              <p>• <strong>Consistent Spacing</strong>: px-2.5 py-0.5 provides balanced padding</p>
              <p>• <strong>Typography</strong>: text-xs font-medium for clean, readable text</p>
              <p>• <strong>8 Color Variants</strong>: Covers the full spectrum of soft, professional colors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeDemo;
