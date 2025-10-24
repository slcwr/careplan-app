// レポート表示コンポーネント（MUI版）

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import { CarePlanReport } from '@/app/lib/types'

interface ReportViewerProps {
  report: CarePlanReport
}

export default function ReportViewer({ report }: ReportViewerProps) {
  return (
    <Card elevation={3}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom color="primary">
          居宅サービス計画書
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {/* 基本情報 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            基本情報
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="caption" color="text.secondary">
                氏名
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {report.client_name}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="caption" color="text.secondary">
                年齢
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {report.client_age}歳
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="caption" color="text.secondary">
                要介護度
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={report.care_level}
                  color="primary"
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 生活課題・ニーズ */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            生活課題・ニーズ
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              生活課題
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
              {report.life_issues}
            </Typography>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              ニーズ
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 3 }}>
              {report.needs.map((need, index) => (
                <Typography component="li" variant="body2" key={index} sx={{ mb: 1 }}>
                  {need}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 目標 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            目標
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              長期目標
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {report.long_term_goal}
            </Typography>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              短期目標
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 3 }}>
              {report.short_term_goals.map((goal, index) => (
                <Typography component="li" variant="body2" key={index} sx={{ mb: 1 }}>
                  {goal}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* サービス内容 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            サービス内容
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell>
                    <Typography variant="caption" fontWeight="bold">
                      サービス種類
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight="bold">
                      事業者
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight="bold">
                      頻度
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight="bold">
                      期間
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.services.map((service, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{service.type}</TableCell>
                    <TableCell>{service.provider}</TableCell>
                    <TableCell>{service.frequency}</TableCell>
                    <TableCell>{service.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* 備考 */}
        {report.remarks && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="h6" gutterBottom color="primary.main">
                備考
              </Typography>
              <Typography variant="body2" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                {report.remarks}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}
