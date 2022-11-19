import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Button,
    Typography,
    Card,
    Table,
    Stack,
    TableRow,
    TableBody,
    TableCell,
    TableContainer,
    Pagination,
    PaginationItem,
    TableHead,
    Chip,
    TextField,
    Grid,
    Box,
} from "@mui/material";

import Scrollbar from "../../../components/Scrollbar";
import Iconify from "../../../components/Iconify";
import { fCurrency } from "../../../utils/formatNumber";
import { showSnackbar } from "../../services/NotificationService";
import { findVouchers, invalidVoucher } from "../../services/VoucherService";
import VoucherListFilter from "./OrderListFilter";
// material

export default function VoucherList() {

    const [data, setData] = useState();

    const [query, setQuery] = useState('');

    const [searchParams, setSearchParams] = useSearchParams();

    const navigate = useNavigate();

    useEffect(() => {
        findVouchers(Object.fromEntries(searchParams.entries())).then(data => {
            setData(data)
        });

    }, [searchParams]);

    const handleSubmitQuery = (e) => {
        e.preventDefault();
        if (query.length == null || query.trimStart().trimEnd().length === 0) {
            showSnackbar("Bạn chưa nhập query.", "warning");
            return;
        }

        setSearchParams({
            ...Object.fromEntries(searchParams.entries()),
            query
        })
    }

    const handleRefresh = () => {
        setQuery('');
        setSearchParams({});
    }

    const handleCreateVoucher = () => {
        navigate(`/dashboard/vouchers/create`);
    }

    const handleInactiveVoucher = async (id) => {
        invalidVoucher(id).then(() => {
            findVouchers(Object.fromEntries(searchParams.entries())).then(data => {
                setData(data)
            });
        }).catch(() => {
            showSnackbar("Có lỗi xảy ra, hãy thử lại sau.", "error");
        })
    }

    const handleStatusFilter = status => {
        if (status) {
            setSearchParams({
                ...Object.fromEntries(searchParams.entries()),
                status
            })
            return;
        }
        setSearchParams({})
    }

    return (<>
        {
            data &&
            <Card>
                <form onSubmit={handleSubmitQuery}>
                    <Grid container spacing={2} p={3} justifyContent={"space-between"}>
                        <Grid item xs={7}>
                            <Stack direction={"row"} spacing={1}>
                                <TextField id="outlined-basic" label="Tìm Đơn Hàng" variant="outlined" size="small" value={query} onChange={e => { setQuery(e.target.value) }} />
                                <Button variant="contained" color="primary" type="submit">Tìm Kiếm</Button>
                                {
                                    searchParams.get('query') &&
                                    <Button variant="contained" color="warning" type="button" onClick={handleRefresh}>Làm Mới</Button>
                                }
                            </Stack>
                        </Grid>
                        <Grid item xs={5} container justifyContent={"flex-end"}>
                            <Box pr={3}>
                                <VoucherListFilter value={searchParams.get('status')} handleStatusFilter={handleStatusFilter} />
                            </Box>
                            <Button variant="contained" onClick={handleCreateVoucher} startIcon={<Iconify icon="eva:plus-fill" />}>
                                Tạo mã giảm giá
                            </Button>
                        </Grid>
                    </Grid>
                </form>
                <Scrollbar>
                    <TableContainer sx={{ minWidth: 800 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Mã</TableCell>
                                    <TableCell align="center">Giá Trị</TableCell>
                                    <TableCell align="center">Giá Trị Tối Đa</TableCell>
                                    <TableCell align="center">Cho Đơn Tối Thiểu</TableCell>
                                    <TableCell align="center">Số Lượng</TableCell>
                                    <TableCell align="center">Quyền</TableCell>
                                    <TableCell align="center">Trạng Thái</TableCell>
                                    <TableCell align="center">Thời Gian</TableCell>
                                    <TableCell align="center">Thao Tác</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {
                                    data.content && data.content.map(voucher => (
                                        <TableRow hover key={voucher.id} tabIndex={-1}>
                                            <TableCell align="center" width={"5%"}>
                                                <Typography variant="body2" flexWrap>
                                                    {voucher.code}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" width={"10%"}>
                                                {
                                                    voucher.voucherType === 'DISCOUNT' ?
                                                        <Typography variant="body2" color={"crimson"} flexWrap>
                                                            {fCurrency(voucher.amount)}
                                                        </Typography> :
                                                        <Chip label={`${voucher.amount} %`} color="secondary" />
                                                }

                                            </TableCell>
                                            <TableCell align="center" width={"10%"}>
                                                <Typography variant="body2" color={"crimson"} flexWrap>
                                                    {voucher.maxValue > 0 ? fCurrency(voucher.maxValue) : ''}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" width={"10%"}>
                                                <Typography variant="body2" flexWrap>
                                                    {fCurrency(voucher.requiredValue)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" width={"5%"}>
                                                <Typography variant="body2" flexWrap>
                                                    {voucher.quantity}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip label={voucher.voucherAccess.description} color={voucher.voucherAccess.color} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip label={voucher.voucherStatus.description} color={voucher.voucherStatus.color} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" flexWrap>
                                                    {`${new Date(voucher.startDate).toLocaleDateString()} - ${new Date(voucher.experationDate).toLocaleDateString()}`}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" width={"14%"}>
                                                <Button hidden={voucher.voucherStatus.name !== "ACTIVE"} variant="outlined" color="error" onClick={() => { handleInactiveVoucher(voucher.id) }}>Hủy Kích Hoạt</Button>
                                                {
                                                    voucher.voucherStatus.name !== "ACTIVE" &&
                                                    <Button variant="outlined" color="error" disabled>Đã Hủy</Button>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }

                                {
                                    data.content.length === 0 &&
                                    <TableRow>
                                        <TableCell align="center" colSpan={7} sx={{ py: 3 }}>
                                            <Typography gutterBottom align="center" variant="subtitle1">
                                                Không Có Dữ Liệu
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                }

                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>

                <Stack alignItems={"center"} spacing={3} py={2}>
                    <Pagination
                        page={data.number + 1}
                        count={data.totalPages}
                        renderItem={(item) => (
                            <PaginationItem
                                component={Link}
                                to={`/dashboard/vouchers${item.page === data.number + 1 ? '' : `?page=${item.page}`}`}
                                {...item}
                            />
                        )}
                    />
                </Stack>
            </Card>
        }
    </>)
}
