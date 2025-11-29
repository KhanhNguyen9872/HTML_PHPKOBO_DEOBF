// Cấu hình Monaco Editor để sử dụng local thay vì CDN
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

// Cấu hình loader để sử dụng monaco-editor từ node_modules thay vì CDN
loader.config({ monaco })

// Cấu hình worker paths - để @monaco-editor/react tự xử lý workers
// Không cần cấu hình MonacoEnvironment vì @monaco-editor/react sẽ tự động xử lý

